RGBA(`
float sdOrientedBox( in vec2 p, in vec2 a, in vec2 b, float th )
{
    float l = length(b-a);
    vec2  d = (b-a)/l;
    vec2  q = (p-(a+b)*0.5);
          q = mat2(d.x,-d.y,d.y,d.x)*q;
          q = abs(q)-vec2(l,th)*0.5;
    return length(max(q,0.0)) + min(max(q.x,q.y),0.0);    
}

float addLine (in vec2 uv, in vec2 p, in float angle, in float length)
{
  return sdOrientedBox(
    uv,
    p,
    vec2(p.x + cos(angle) * length, p.y + sin(angle) * length),
    0.01
  );
}

float addWave (in vec2 uv, in vec2 p, in float length)
{
  float t = time * 0.1;
  return sdOrientedBox(
    vec2(uv.x, uv.y + sin((uv.x + t) * 30.) * 0.02),
    vec2(p.x - length * 0.5, p.y),
    vec2(p.x + length * 0.5, p.y),
    0.01
  );
}

//https://iquilezles.org/articles/palettes/
vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);

    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy*2.-1.;
  uv.y *= resolution.y/resolution.x;

  float d = 1.;
  float PI = 3.14159;
  
  float t = time * 0.1;
  float y1 = sin((uv.x - 0.125 + t) * 30.) * 0.02 - 0.005;
  float y2 = sin((uv.x + 0.125 + t) * 30.) * 0.02 - 0.005;
  float angle = pow(clamp(sin(time) + 1., 0., 1.), 4.);
  
  uv=vec2(
    atan(uv.x, uv.y) + time * 0.1,
    (log(length(uv)) - atan(uv.x, uv.y) + time * 0.1)
  );
  
  // uv = mod(uv, mix(0.2, 0.6, angle)) - 0.15;
  uv = mod(uv, vec2(0.3, PI * 0.1)) - 0.15;
  
  // left
  d = min(addLine(uv, vec2(-0.125, y1), mix(0., PI * 0.4, angle), 0.15), d);
  
  // right
  d = min(addLine(uv, vec2(0.125, y2), mix(PI, PI * 0.6, angle), 0.1), d);
  
  // wave
  d = min(addWave(uv, vec2(0.), mix(0.5, 0.2, angle)), d);
  
  d = smoothstep(0.0, mix(0.1, 0.001, angle), d);

  vec3 bgColor = palette(gl_FragCoord.y + gl_FragCoord.x + t) * 0.1;
  vec3 fgColor = palette(uv.y + uv.x * 0.001 + t);
  vec3 color = mix(fgColor, bgColor, d);

  gl_FragColor = vec4(color, 1.0);
}

`)