
#ifdef GL_ES
precision lowp float;
#else
#define highp
#define mediump
#define lowp
#endif

#if __VERSION__ >= 300
#define SAMPLER_FNC(TEX, UV) texture(TEX, UV)
in vec2 texCoord0;
out vec4 outColor;  // new in opengl3
#define COLOR_OUT outColor
#else
#define SAMPLER_FNC(TEX, UV) texture2D(TEX, UV)
varying vec2 texCoord0;
#define COLOR_OUT gl_FragColor
#endif

uniform sampler2D inputTexture;
uniform sampler2D prevTexture;
uniform float filterSharpness;
uniform float filterBrightness;
uniform float widthRatio;
uniform float heightRatio;
uniform float denoiseLevel;
uniform float version; //材质封装层目前不支持int类型，先用float代替
uniform vec4 faceRect0;//第一个人脸 left top right bottom，归一化【0，1】，默认（0，0，0，0）,没该人脸时为默认值
uniform vec4 faceRect1;//第二个人脸 left top right bottom，归一化【0，1】，默认（0，0，0，0）,没该人脸时为默认值
uniform float faceCount; //人脸数量 【0，2】材质封装层目前不支持int类型，先用float代替

#define SATURATE(x) clamp(x, 0.0, 1.0)
#define RGB_SAMPLER_FNC(TEX, UV) SAMPLER_FNC(TEX, UV).rgb
#define RGB2Y(x) dot(x, vec3(0.299, 0.587, 0.114))

float strength_map(float strength)  //strength from 4 ~ 20
{
    if(strength <= 0.2)
        return (-200.0 * strength + 79.0);
    else if(strength > 0.2 && strength <= 0.4)
        return (-50.0  * strength + 49.0);
    else if(strength > 0.4)
        return (-20.0  * strength + 37.0);
}

vec3 rgb2yuv(vec3 rgb)
{
    const mat3 coeffs = mat3(
            0.299, 0.587, 0.114, 
            -0.147,-0.289, 0.436, 
            0.615,-0.515,-0.100);
	return rgb * coeffs;
}

vec3 yuv2rgb(vec3 yuv)
{
    const mat3 coeffs = mat3(
			 1.000, 0.000, 1.140,
			 1.000,-0.395,-0.581,
			 1.000, 2.032, 0.000);
	return yuv * coeffs;
}

float lowpass(float prev, float cur, float gamma) {
    // only do Y channel lowpass filtering
    float d = prev - cur;
    // calculate coeff
    float simil = 1.0 - abs(d);
    float C = pow(simil, gamma) * d;
    float y = SATURATE(cur + C);
    return y;
}

vec3 denoise3D(sampler2D tex, sampler2D prev_tex, vec2 st, vec2 pixel, float gamma_spatial, float gamma_tempo) {
    //    b    
    // c  a  d 
    //    e    
    vec3 a = RGB_SAMPLER_FNC(tex, st);
    vec3 b = RGB_SAMPLER_FNC(tex, st + vec2( 0.0, -1.0) * pixel);
    vec3 c = RGB_SAMPLER_FNC(tex, st + vec2(-1.0,  0.0) * pixel);
    vec3 d = RGB_SAMPLER_FNC(tex, st + vec2( 1.0,  0.0) * pixel);
    vec3 e = RGB_SAMPLER_FNC(tex, st + vec2( 0.0,  1.0) * pixel);
    vec3 prev_a = RGB_SAMPLER_FNC(prev_tex, st);

    vec3 a_yuv = rgb2yuv(a);
    float tmp = lowpass(RGB2Y(b), a_yuv.r, gamma_spatial);
    tmp = lowpass(RGB2Y(c), tmp, gamma_spatial);
    tmp = lowpass(RGB2Y(d), tmp, gamma_spatial);
    tmp = lowpass(RGB2Y(e), tmp, gamma_spatial);
    tmp = lowpass(RGB2Y(prev_a), tmp, gamma_tempo);
    return yuv2rgb(vec3(tmp, a_yuv.g, a_yuv.b));
}

void main()
{
    highp vec4 textureColor = SAMPLER_FNC(inputTexture, texCoord0);
    vec3 filterColor = textureColor.rgb;

    if (version > 0.5 && denoiseLevel >= 0.01)
    {
        float gamma_spatial, gamma_tempo;
        vec2 pixel = vec2(widthRatio, heightRatio);
        gamma_spatial = strength_map(denoiseLevel);
        gamma_tempo = strength_map(denoiseLevel / 2.0);
        filterColor = denoise3D(inputTexture, prevTexture, texCoord0, pixel, gamma_spatial, gamma_tempo).rgb;
    }

    COLOR_OUT = vec4(filterColor, textureColor.a);
}