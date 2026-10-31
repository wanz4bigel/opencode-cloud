precision lowp float;
uniform sampler2D inputImageTexture;
 varying highp vec2 textureCoordinate;
 uniform sampler2D lutImageTexture;
 uniform vec4 v4Param;


 vec4 smoothskin(vec4 sourceColor)
  {
      float central;
      float gaussianWeightTotal;
      float sum;
      float sample;
      float distanceFromCentralColor;
      float gaussianWeight;

      float distanceNormalizationFactor = 3.6;

      central = sourceColor.g;
      gaussianWeightTotal = 0.2;
      sum = central * 0.2;
      vec2 blurCoordinates2[8];
      vec2 blurCoordinates[12];

      float smooth = v4Param.x;
      float enhance = v4Param.y;

      float mul_x = 0.00277777;
      float mul_y = 0.0015625;

      blurCoordinates[0] = textureCoordinate.xy + vec2(0.0 * mul_x,-10.0 * mul_y);
      blurCoordinates[1] = textureCoordinate.xy + vec2(5.0 * mul_x,-8.0 * mul_y);
      blurCoordinates[2] = textureCoordinate.xy + vec2(8.0 * mul_x,-5.0 * mul_y);
      blurCoordinates[3] = textureCoordinate.xy + vec2(10.0 * mul_x,0.0 * mul_y);
      blurCoordinates[4] = textureCoordinate.xy + vec2(8.0 * mul_x,5.0 * mul_y);
      blurCoordinates[5] = textureCoordinate.xy + vec2(5.0 * mul_x,8.0 * mul_y);
      blurCoordinates[6] = textureCoordinate.xy + vec2(0.0 * mul_x,10.0 * mul_y);
      blurCoordinates[7] = textureCoordinate.xy + vec2(-5.0 * mul_x,8.0 * mul_y);
      blurCoordinates[8] = textureCoordinate.xy + vec2(-8.0 * mul_x,5.0 * mul_y);
      blurCoordinates[9] = textureCoordinate.xy + vec2(-10.0 * mul_x,0.0 * mul_y);
      blurCoordinates[10] = textureCoordinate.xy + vec2(-8.0 * mul_x,-5.0 * mul_y);
      blurCoordinates[11] = textureCoordinate.xy + vec2(-5.0 * mul_x,-8.0 * mul_y);

      mul_x = 0.00222222;
      mul_y = 0.00125;

      blurCoordinates2[0] = textureCoordinate.xy + vec2(0.0 * mul_x,-6.0 * mul_y);
      blurCoordinates2[1] = textureCoordinate.xy + vec2(-4.0 * mul_x,-4.0 * mul_y);
      blurCoordinates2[2] = textureCoordinate.xy + vec2(-6.0 * mul_x,0.0 * mul_y);
      blurCoordinates2[3] = textureCoordinate.xy + vec2(-4.0 * mul_x,4.0 * mul_y);
      blurCoordinates2[4] = textureCoordinate.xy + vec2(0.0 * mul_x,6.0 * mul_y);
      blurCoordinates2[5] = textureCoordinate.xy + vec2(4.0 * mul_x,4.0 * mul_y);
      blurCoordinates2[6] = textureCoordinate.xy + vec2(6.0 * mul_x,0.0 * mul_y);
      blurCoordinates2[7] = textureCoordinate.xy + vec2(4.0 * mul_x,-4.0 * mul_y);

      sample = texture2D(inputImageTexture, blurCoordinates[0]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.08 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates[1]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.08 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates[2]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.08 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates[3]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.08 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates[4]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.08 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates[5]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.08 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates[6]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.08 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates[7]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.08 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates[8]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.08 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates[9]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.08 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates[10]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.08 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates[11]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.08 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;



      sample = texture2D(inputImageTexture, blurCoordinates2[0]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.1 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates2[1]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.1 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;
      sample = texture2D(inputImageTexture, blurCoordinates2[2]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.1 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates2[3]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.1 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates2[4]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.1 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates2[5]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.1 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates2[6]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.1 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sample = texture2D(inputImageTexture, blurCoordinates2[7]).g;
      distanceFromCentralColor = min(abs(central - sample) * distanceNormalizationFactor, 1.0);
      gaussianWeight = 0.1 * (1.0 - distanceFromCentralColor);
      gaussianWeightTotal += gaussianWeight;
      sum += sample * gaussianWeight;

      sum = sum/gaussianWeightTotal;


      sample = sourceColor.g - sum + 0.5;



      for(int i = 0; i < 5; ++i) {
          if(sample <= 0.5) {
              sample = sample * sample * 2.0;
          }
          else {
              sample = 1.0 - ((1.0 - sample)*(1.0 - sample) * 2.0);
          }
      }


      float aa = 1.0 + pow(sum, 0.3)*0.09;
      vec3 smoothColor = sourceColor.rgb*aa - vec3(sample)*(aa-1.0);
      smoothColor = clamp(smoothColor,vec3(0.0),vec3(1.0));
      smoothColor = mix(sourceColor.rgb, smoothColor, pow(sourceColor.g, 0.33));
      smoothColor = mix(sourceColor.rgb, smoothColor, pow(sourceColor.g, 0.39));

      smoothColor = mix(sourceColor.rgb, smoothColor, smooth);
      vec4 retColor  = vec4(pow(smoothColor, vec3(0.96) * enhance),sourceColor.a);
      return retColor;
  }


 vec4 lut(vec4 textureColor, sampler2D lutSampler)
 {
     highp float blueColor = textureColor.b * 63.0;
     float intensity = v4Param.z;
     highp vec2 quad1;
     quad1.y = floor(floor(blueColor) / 8.0);
     quad1.x = floor(blueColor) - (quad1.y * 8.0);

     highp vec2 quad2;
     quad2.y = floor(ceil(blueColor) / 8.0);
     quad2.x = ceil(blueColor) - (quad2.y * 8.0);

     highp vec2 texPos1;
     texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
     texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);

     highp vec2 texPos2;
     texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
     texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);

     lowp vec4 newColor1 = texture2D(lutSampler, texPos1);
     lowp vec4 newColor2 = texture2D(lutSampler, texPos2);

     lowp vec4 newColor = mix(newColor1, newColor2, fract(blueColor));
     vec4 retColor = mix(textureColor, vec4(newColor.rgb, textureColor.w), intensity);
     return retColor;
 }



 void main()
{
    vec4 sourceColor = texture2D(inputImageTexture, textureCoordinate);

    if (v4Param.x > 0.01) {
        sourceColor = smoothskin(sourceColor);
    }
    sourceColor = lut(sourceColor, lutImageTexture);
    gl_FragColor = sourceColor;

}