
RGBA(`
float sdMoon(vec2 p, float d, float ra, float rb )
{
    p.y = abs(p.y);
    float a = (ra*ra - rb*rb + d*d)/(2.0*d);
    float b = sqrt(max(ra*ra-a*a,0.0));
    if( d*(p.x*b-p.y*a) > d*d*max(b-p.y,0.0) )
          return length(p-vec2(a,b));
    return max( (length(p          )-ra),
               -(length(p-vec2(d,0))-rb));
}

#define GLASS_REFRACTION 0.125;

vec2 glass(vec2 uv) {
  float stripesCount = 22.;
  float sShift = fract(uv.y * stripesCount) - 0.5;
  uv.y += sShift * GLASS_REFRACTION;
  return uv;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy*2.-1.;
  uv.y *= resolution.y/resolution.x;
  uv=vec2(
    atan(uv.y + sin(time * 0.5), uv.x + cos(time * 0.5)),
    (log(length(uv))-time * 0.1)*0.85
  );
  uv = glass(uv);
  uv.x += sin(time * 10. + uv.y * 40.) * 0.01;
  uv.x = mod(uv.x, 0.5) - 0.25;
  uv.y = mod(uv.y, 0.5) - 0.25;

  float d = 1.;
  
  float ra = 0.2;
  float rb = 0.18;
  float e = (
    + sin(gl_FragCoord.x * 0.01) 
    + sin(gl_FragCoord.y * 0.01)
    )
    
    * (
    + sin(gl_FragCoord.x * 0.02) 
    + sin(gl_FragCoord.y * 0.02)
    )
    ;
  float di = 0.5*cos(e - time+3.9);
  
  d = min(d, sdMoon(uv, di, ra, rb));
  d = smoothstep(0.0, 0.1, d);
  
  vec3 fgColor = vec3(0.4, 0.45, 0.5);
  vec3 bgColor = vec3(0.2, 0.2, 0.3);

  vec3 color = mix(fgColor, bgColor, d);

  gl_FragColor = vec4(color, 1.);
}

`)