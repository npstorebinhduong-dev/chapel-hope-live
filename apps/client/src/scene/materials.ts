import * as T from "three";
/** Original analytic patterns: stable object-space grain, no downloaded textures. */
function patterned(color: string, wood: boolean) {
  const material = new T.MeshStandardMaterial({
    color,
    roughness: wood ? 0.63 : 0.86,
  });
  material.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 surfacePosition;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nsurfacePosition=position;",
      );
    s.fragmentShader = s.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 surfacePosition;",
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
 vec3 p=surfacePosition;float grain=${wood ? "sin(p.x*130.+sin(p.z*11.)*4.+sin(p.x*21.)*1.3)" : "sin(p.x*47.+sin(p.y*33.))*sin(p.z*29.+p.y*67.)"};
 diffuseColor.rgb*=.94+grain*${wood ? ".09" : ".035"};`,
      );
  };
  material.customProgramCacheKey = () =>
    wood ? "original-oak-v12" : "original-limestone-v12";
  return material;
}
export const woodMaterial = patterned("#60432c", true);
export const stoneMaterial = patterned("#c0ae91", false);
