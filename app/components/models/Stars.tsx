
import { Stars } from "@react-three/drei";

const StarsContainer = () => {
  return (
    <Stars radius={200} depth={100} count={7000} factor={10} saturation={0.8} fade={true} speed={1.5} />
  );
};

export default StarsContainer;