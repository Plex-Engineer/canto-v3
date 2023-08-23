import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Splash from "@/components/splash/splash";
import Text from "@/components/text";

export default function HomePage() {
  return (
    <div>
      <Text size="x-lg" font="proto_mono">
        Home Page
      </Text>

      <Splash />
    </div>
  );
}
