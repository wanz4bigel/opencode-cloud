
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


void main()
{
    COLOR_OUT = SAMPLER_FNC(inputTexture, texCoord0);
}
