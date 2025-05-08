import { ShaderArt } from 'https://esm.sh/shader-art'
import { UniformPlugin } from 'https://esm.sh/@shader-art/plugin-uniform';

ShaderArt.register([() => new UniformPlugin()])