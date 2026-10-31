
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
uniform vec4 faceRect0;//第一个人脸 left top right bottom，归一化【0，1】，默认（0，0，0，0）,没该人脸时为默认值, left < right, top < bottom
uniform vec4 faceRect1;//第二个人脸 left top right bottom，归一化【0，1】，默认（0，0，0，0）,没该人脸时为默认值,
uniform float faceCount; //人脸数量 【0，2】材质封装层目前不支持int类型，先用float代替

#define RGB2LUMA(x) dot(x, vec3(0.299, 0.587, 0.114))

#define SATURATE(x) clamp(x, 0.0, 1.0)

#define SHARPEN_SAMPLER_FNC(TEX, UV) SAMPLER_FNC(TEX, UV).rgb

vec3 edgeDetectSharpenV0(sampler2D tex, vec2 st, vec2 pixel, float strength) {

    // [                                    ]
    // [      c13,   ,  c9,    ,  c14,      ]
    // [         , c1,  c2,  c3,     ,      ]
    // [      c10, c4,  c0,  c5,  c11,      ]
    // [         , c6,  c7,  c8,     ,      ]
    // [      c15,   ,  c12,   ,  c16,      ]
    // [                                    ]
    vec3 c[25];
    c[0] = SHARPEN_SAMPLER_FNC(tex, st + vec2(0.0, 0.0) * pixel);

    c[1] = SHARPEN_SAMPLER_FNC(tex, st + vec2(-1.0, -1.0) * pixel);
    c[2] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 0.0, -1.0) * pixel);
    c[3] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 1.0, -1.0) * pixel);

    c[4] = SHARPEN_SAMPLER_FNC(tex, st + vec2(-1.0, 1.0) * pixel);
    c[5] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 1.0, 0.0) * pixel);

    c[6] = SHARPEN_SAMPLER_FNC(tex, st + vec2(-1.0, 1.0) * pixel);
    c[7] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 0.0, 1.0) * pixel);
    c[8] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 1.0, 1.0) * pixel);

    c[9] = SHARPEN_SAMPLER_FNC(tex, st + vec2(  0.0, -2.0) * pixel);
    c[10] = SHARPEN_SAMPLER_FNC(tex, st + vec2(-2.0,  0.0) * pixel);
    c[11] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 2.0,  0.0) * pixel);
    c[12] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 0.0,  2.0) * pixel);

    c[13] = SHARPEN_SAMPLER_FNC(tex, st + vec2( -2.0, -2.0) * pixel);
    c[14] = SHARPEN_SAMPLER_FNC(tex, st + vec2( -2.0,  2.0) * pixel);
    c[15] = SHARPEN_SAMPLER_FNC(tex, st + vec2(  2.0, -2.0) * pixel);
    c[16] = SHARPEN_SAMPLER_FNC(tex, st + vec2(  2.0,  2.0) * pixel);

    vec3 mask = 20.0 * c[0]
               - 2.0 * (c[1]  + c[3] + c[6]  + c[8])
               - 1.0 * (c[2]  + c[4] + c[5]  + c[7] +
                        c[9]  + c[10] + c[11]  + c[12] +
                        c[13]  + c[14] + c[15]  + c[16]);
    mask = step(40.0 / 255.0, abs(mask));

    // edge detect
    //  a b c
    //  d(e)f
    //  g h i
    vec3 edge = 8.0 * c[0] - (c[1]  + c[3] + c[6] + c[8] + c[2]  + c[4] + c[5]  + c[7]);
    vec3 sharpen = c[0] + mask * edge * 0.2;

    // overshoot control
    float over_ctrl = strength / 2.0;

    vec3 mnRGB = min(min(min(c[4], c[0]), min(c[5], c[2])), c[7]);
    mnRGB += min(mnRGB, min(min(c[1], c[3]), min(c[6], c[8])));
    mnRGB /= 2.0;

    vec3 mxRGB = max(max(max(c[4], c[0]), max(c[5], c[2])), c[7]);
    mxRGB +=  max(mxRGB, max(max(c[1], c[3]), max(c[6], c[8])));
    mxRGB /= 2.0;

    vec3 flag = step(mxRGB, sharpen);
    vec3 flag2 = step(sharpen, mnRGB);
    sharpen = mix(sharpen,  mxRGB + over_ctrl * (sharpen - mxRGB), flag);
    sharpen = mix(sharpen, mnRGB + over_ctrl * (sharpen - mnRGB), flag2);
    return SATURATE(sharpen);
}

vec3 edgeDetectSharpenV1(sampler2D tex, vec2 st, vec2 pixel, float strength) {

    // [                                    ]
    // [      c13,   ,  c9,    ,  c14,      ]
    // [         , c1,  c2,  c3,     ,      ]
    // [      c10, c4,  c0,  c5,  c11,      ]
    // [         , c6,  c7,  c8,     ,      ]
    // [      c15,   ,  c12,   ,  c16,      ]
    // [                                    ]
    vec3 c[25];
    c[0] = SHARPEN_SAMPLER_FNC(tex, st + vec2(0.0, 0.0) * pixel);

    c[1] = SHARPEN_SAMPLER_FNC(tex, st + vec2(-1.0, -1.0) * pixel);
    c[2] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 0.0, -1.0) * pixel);
    c[3] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 1.0, -1.0) * pixel);

    c[4] = SHARPEN_SAMPLER_FNC(tex, st + vec2(-1.0, 1.0) * pixel);
    c[5] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 1.0, 0.0) * pixel);

    c[6] = SHARPEN_SAMPLER_FNC(tex, st + vec2(-1.0, 1.0) * pixel);
    c[7] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 0.0, 1.0) * pixel);
    c[8] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 1.0, 1.0) * pixel);

    c[9] = SHARPEN_SAMPLER_FNC(tex, st + vec2(  0.0, -2.0) * pixel);
    c[10] = SHARPEN_SAMPLER_FNC(tex, st + vec2(-2.0,  0.0) * pixel);
    c[11] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 2.0,  0.0) * pixel);
    c[12] = SHARPEN_SAMPLER_FNC(tex, st + vec2( 0.0,  2.0) * pixel);

    c[13] = SHARPEN_SAMPLER_FNC(tex, st + vec2( -2.0, -2.0) * pixel);
    c[14] = SHARPEN_SAMPLER_FNC(tex, st + vec2( -2.0,  2.0) * pixel);
    c[15] = SHARPEN_SAMPLER_FNC(tex, st + vec2(  2.0, -2.0) * pixel);
    c[16] = SHARPEN_SAMPLER_FNC(tex, st + vec2(  2.0,  2.0) * pixel);

    // Blur
    // selectBlur(blur, img, 1, 20);

    vec3 mask = 20.0 * c[0]
               - 2.0 * (c[1]  + c[3] + c[6]  + c[8])
               - 1.0 * (c[2]  + c[4] + c[5]  + c[7] +
                        c[9]  + c[10] + c[11]  + c[12] +
                        c[13]  + c[14] + c[15]  + c[16]);
    mask = step(40.0 / 255.0, abs(mask));

    // edge detect
    //  a b c
    //  d(e)f
    //  g h i
    vec3 edge = 8.0 * c[0] - (c[1]  + c[3] + c[6] + c[8] + c[2]  + c[4] + c[5]  + c[7]);
    vec3 sharpen = c[0] + mask * edge * 0.5 * strength;

    // overshoot control
    float over_ctrl = 0.8;

    vec3 mnRGB = min(min(min(c[4], c[0]), min(c[5], c[2])), c[7]);
    mnRGB += min(mnRGB, min(min(c[1], c[3]), min(c[6], c[8])));
    mnRGB /= 2.0;

    vec3 mxRGB = max(max(max(c[4], c[0]), max(c[5], c[2])), c[7]);
    mxRGB +=  max(mxRGB, max(max(c[1], c[3]), max(c[6], c[8])));
    mxRGB /= 2.0;

    vec3 flag = step(mxRGB, sharpen);
    vec3 flag2 = step(sharpen, mnRGB);
    sharpen = mix(sharpen,  mxRGB + over_ctrl * (sharpen - mxRGB), flag);
    sharpen = mix(sharpen, mnRGB + over_ctrl * (sharpen - mnRGB), flag2);
    return SATURATE(sharpen);
}

float scale(float x, float alpha, float beta)
{
    // don't strech too much for very dark and very bright region
    float ratio = 0.5 * smoothstep(0.0, 0.1, x) + 0.5 - 0.5 * smoothstep(0.9, 1.0, x);
    return mix(x, SATURATE(x + alpha + beta), ratio);
}

vec3 lumaLiftGammaGain(vec3 color)
{
    // vec3 color = SHARPEN_SAMPLER_FNC(tex, st);
    float luma = RGB2LUMA(color);

    // -- Offset --
    // float offset = 0.00;
    // -- Lift --
    float lift = (1.0 - smoothstep(0.0, 0.3, luma)) * 0.1;
    // -- Gamma --
    float gamma = 0.8;
    // -- Gain --
    float gain = (pow(luma, gamma) ) - luma;

    // return saturate(color * gain + lift);
    return vec3(scale(color.r, gain, lift),
                        scale(color.g, gain, lift),
                        scale(color.b, gain, lift));
}

bool inRect(vec2 pos, vec4 rect)
{
    float h = rect.w - rect.y;
    return (pos.x > rect.x && pos.x < rect.z && 1.0 - pos.y + h * 0.25 > rect.y && 1.0 - pos.y < rect.w);
}

void main()
{    
    highp vec4 textureColor = SAMPLER_FNC(inputTexture, texCoord0); 
    vec3 resColor = textureColor.rgb;
    vec3 filterColor = resColor;

    vec2 pixel = vec2(widthRatio, heightRatio);

    if (filterSharpness > 0.01)
    {
        float strength =  clamp(filterSharpness, 0.0, 1.0);
        if (version > 0.5)
        {
            if (version > 0.5 && (inRect(texCoord0, faceRect0) || inRect(texCoord0, faceRect1)))
                strength = strength * 0.3;

            filterColor = edgeDetectSharpenV1(inputTexture, texCoord0, pixel, strength).rgb;
        }
        else
        {
            filterColor = edgeDetectSharpenV0(inputTexture, texCoord0, pixel, strength).rgb;
            filterColor = mix(resColor, filterColor, strength);
        }
    }

    if (filterBrightness > 0.01)
    {
        filterColor = mix(filterColor, lumaLiftGammaGain(filterColor), filterBrightness);
    }

    // if (version > 0.5 && (inRect(texCoord0, faceRect0) || inRect(texCoord0, faceRect1)))
    //        filterColor = mix(vec3(0.0), filterColor, 0.5);
           
    COLOR_OUT = vec4(filterColor, 1.0);
}
