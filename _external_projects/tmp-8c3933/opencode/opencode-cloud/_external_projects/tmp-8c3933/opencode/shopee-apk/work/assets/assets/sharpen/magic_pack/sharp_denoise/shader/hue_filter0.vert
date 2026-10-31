#ifdef GL_ES
precision highp  float;
#else
#define highp
#define mediump
#define lowp
#endif
attribute vec4 position;
attribute vec2 texCoord;
varying vec2 texCoord0; 


void main(void)
{
    gl_Position =  position;
    texCoord0 = texCoord;
}