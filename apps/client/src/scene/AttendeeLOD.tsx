import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as T from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { attendeePose, type Attendee, type ActiveGift } from "@chapel/shared";
import { Crowd } from "../Crowd";
import { assets, type LicensedAsset } from "../assets";
import { renderClock } from "../store";
class AssetBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function LicensedPerson({
  asset,
  attendee,
  active,
}: {
  asset: LicensedAsset;
  attendee: Attendee;
  active: ActiveGift | null;
}) {
  const gltf = useGLTF(asset.url),
    model = useMemo(() => {
      if (!gltf.scene.getObjectByProperty("isSkinnedMesh", true))
        throw new Error("Licensed humanoid requires a skinned mesh");
      for (const state of [
        "spawning",
        "walking_to_seat",
        "seated",
        "praying_idle",
        "kneeling",
        "gift_reacting",
        "leaving",
      ] as const) {
        const name = asset.animations?.[state];
        if (!name || !gltf.animations.some((clip) => clip.name === name))
          throw new Error(`Missing licensed animation: ${state}`);
      }
      return clone(gltf.scene);
    }, [gltf.scene, gltf.animations, asset]);
  const root = useRef<T.Group>(null!),
    current = useRef<T.AnimationAction | null>(null);
  const { actions } = useAnimations(gltf.animations, root);
  useFrame((_state, dt) => {
    const pose = attendeePose(attendee, renderClock(), active);
    root.current.visible = pose.visible;
    root.current.position.set(pose.position[0], 0, pose.position[2]);
    const clip = asset.animations?.[pose.state],
      next = clip ? actions[clip] : null;
    if (next && next !== current.current) {
      current.current?.fadeOut(0.3);
      next.reset().fadeIn(0.3).play();
      current.current = next;
    }
  });
  useEffect(
    () => () => {
      Object.values(actions).forEach((action) => action?.stop());
    },
    [actions],
  );
  return (
    <group ref={root}>
      <primitive
        object={model}
        scale={asset.scale}
        rotation={[0, asset.forwardRotation ?? 0, 0]}
      />
    </group>
  );
}
/** Optional licensed rig at the focus slot; all other bodies retain bounded instancing. */
export function AttendeeLOD(props: ComponentProps<typeof Crowd>) {
  const asset = assets.humanoid;
  const selected =
    asset &&
    props.attendees.find(
      (a) => a.userId === props.active?.event.userId && !a.renderRole,
    );
  if (!asset || !selected || props.active?.presentation)
    return <Crowd {...props} />;
  const fallback = <Crowd attendees={[selected]} active={props.active} />;
  return (
    <>
      <Crowd
        {...props}
        attendees={props.attendees.filter((a) => a !== selected)}
      />
      <AssetBoundary key={asset.url} fallback={fallback}>
        <Suspense fallback={fallback}>
          <LicensedPerson
            asset={asset}
            attendee={selected}
            active={props.active}
          />
        </Suspense>
      </AssetBoundary>
    </>
  );
}
