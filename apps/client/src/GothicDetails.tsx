import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as T from "three";
import { QUALITY, useQuality } from "./quality";
function PointedArch({
  x,
  z,
  rotation = 0,
  width = 2,
  height = 4,
}: {
  x: number;
  z: number;
  rotation?: number;
  width?: number;
  height?: number;
}) {
  const curve = useMemo(
    () =>
      new T.CatmullRomCurve3([
        new T.Vector3(-width / 2, 0, 0),
        new T.Vector3(-width / 2, height * 0.62, 0),
        new T.Vector3(-width * 0.32, height * 0.87, 0),
        new T.Vector3(0, height, 0),
        new T.Vector3(width * 0.32, height * 0.87, 0),
        new T.Vector3(width / 2, height * 0.62, 0),
        new T.Vector3(width / 2, 0, 0),
      ]),
    [width, height],
  );
  return (
    <group position={[x, 2.5, z]} rotation={[0, rotation, 0]}>
      {[1, 1.08].map((scale) => (
        <mesh key={scale} scale={[scale, scale, 1]}>
          <tubeGeometry args={[curve, 30, 0.075, 5, false]} />
          <meshStandardMaterial
            color={scale === 1 ? "#c3ad8a" : "#8e7c65"}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}
/** Original analytic stone pattern, no downloaded textures. */
const stoneMaterial = new T.MeshStandardMaterial({
  color: "#a99578",
  roughness: 0.94,
});
stoneMaterial.onBeforeCompile = (shader) => {
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      "#include <common>\nvarying vec3 stonePosition;",
    )
    .replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nstonePosition=position;",
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      "#include <common>\nvarying vec3 stonePosition;",
    )
    .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
 float row=floor(stonePosition.y*1.6);
 vec2 brick=fract(vec2(stonePosition.x*.8+mod(row,2.)*.5,stonePosition.y*1.6));
 float mortar=1.-smoothstep(.014,.035,min(min(brick.x,1.-brick.x),min(brick.y,1.-brick.y)));
 float grain=fract(sin(dot(stonePosition,vec3(73.1,127.7,39.2)))*43758.5453);
 diffuseColor.rgb*=mix(.96+grain*.08,.68,mortar);`,
    );
};
function SunShaft({ x, z, color }: { x: number; z: number; color: string }) {
  const geometry = useMemo(() => {
    const g = new T.BufferGeometry();
    g.setAttribute(
      "position",
      new T.Float32BufferAttribute(
        [
          x,
          7,
          z,
          x,
          4,
          z + 1.5,
          -x * 0.4,
          0.05,
          z + 5,
          x,
          7,
          z,
          -x * 0.4,
          0.05,
          z + 5,
          -x * 0.4,
          0.05,
          z + 2,
        ],
        3,
      ),
    );
    g.setAttribute(
      "uv",
      new T.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2),
    );
    return g;
  }, [x, z]);
  return (
    <mesh geometry={geometry} renderOrder={1}>
      <shaderMaterial
        transparent
        depthWrite={false}
        side={T.DoubleSide}
        blending={T.AdditiveBlending}
        uniforms={{ tint: { value: new T.Color(color) } }}
        vertexShader="varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }"
        fragmentShader="uniform vec3 tint; varying vec2 vUv; void main(){float edge=pow(sin(vUv.x*3.14159),2.);gl_FragColor=vec4(tint,edge*(1.-vUv.y)*.085);}"
      />
    </mesh>
  );
}
export function GothicDetails() {
  const low = useQuality((s) => s.level === "low");
  const flames = useRef<T.InstancedMesh>(null!);
  const dummy = useMemo(() => new T.Object3D(), []);
  useFrame(({ clock }) => {
    for (let i = 0; i < 12; i++) {
      dummy.position.set(i < 6 ? -5.4 : 5.4, 2.6, -10 + (i % 6) * 3.8);
      dummy.scale.set(
        0.035,
        0.09 + Math.sin(clock.elapsedTime * 2 + i) * 0.012,
        0.035,
      );
      dummy.updateMatrix();
      flames.current.setMatrixAt(i, dummy.matrix);
    }
    flames.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <mesh position={[0, 5.4, -13.18]} material={stoneMaterial}>
        <planeGeometry args={[14.8, 10.8]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          {[-10, -5, 0, 5, 10].map((z) => (
            <group key={z}>
              <PointedArch
                x={side * 7.02}
                z={z + 2}
                rotation={(side * Math.PI) / 2}
                width={3.5}
                height={5.7}
              />
              {[0, 1, 2].map((i) => (
                <mesh key={i} position={[side * (6.86 - i * 0.13), 4, z]}>
                  <cylinderGeometry args={[0.065, 0.085, 7.8, 6]} />
                  <meshStandardMaterial color="#b8a283" />
                </mesh>
              ))}
            </group>
          ))}
          {[-9, -3, 3, 9].map((z) => (
            <group key={z}>
              <SunShaft
                x={side * 7}
                z={z}
                color={side === 1 ? "#e5bd74" : "#7ca5bb"}
              />
              {!low &&
                [0, 1, 2].map((i) => (
                  <mesh
                    key={i}
                    position={[-side * (0.2 + i * 0.7), 0.045, z + 3 + i * 0.5]}
                    rotation={[-Math.PI / 2, 0, 0.45]}
                  >
                    <planeGeometry args={[0.55, 3]} />
                    <meshBasicMaterial
                      color={["#c99b55", "#6b8fba", "#a95849"][i]}
                      transparent
                      opacity={0.16}
                      depthWrite={false}
                    />
                  </mesh>
                ))}
            </group>
          ))}
        </group>
      ))}
      <PointedArch x={0} z={-13.03} width={5.7} height={7.7} />
      {[-4.9, 4.9].map((x) => (
        <PointedArch key={x} x={x} z={-13.02} width={2.1} height={5.6} />
      ))}
      <instancedMesh ref={flames} args={[undefined, undefined, 12]}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshBasicMaterial color="#ffd18a" />
      </instancedMesh>
    </group>
  );
}
