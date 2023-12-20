import style from "./animatedCircle.module.scss";

const AnimatedCircle = () => {
  const delays = 40;
  const circles = Array.from({ length: delays });
  return (
    // create a array of length delays
    // map through the array
    // for each element, create a div
    // give the div a class of circle
    // give the div a style of --anim-delay: ${index}s

    <div className={style.container}>
      {circles.map((_, index) => (
        <div
          key={index}
          className={style.circle}
          style={
            {
              //   "--anim-delay": `${index}s`,
              "--init-size": `${(index / 40) * 100}%`,
            } as React.CSSProperties
          }
        ></div>
      ))}
    </div>
  );
};

export default AnimatedCircle;
