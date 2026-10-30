
precision mediump float;

varying mediump vec2 textureCoordinate;

uniform sampler2D inputImageTexture;
uniform lowp float brightness;

void main() {
    gl_FragColor = texture2D(inputImageTexture, textureCoordinate);
    lowp vec4 textureColor = texture2D(inputImageTexture, textureCoordinate);
    gl_FragColor = vec4((textureColor.rgb + vec3(brightness)), textureColor.w);
}