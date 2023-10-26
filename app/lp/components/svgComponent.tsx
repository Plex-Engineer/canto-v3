import React, { useEffect } from "react";
import styles from "./svgComponent.module.scss";
const SVGComponent = () => {
  const ref = React.useRef<any>(null);

  const points = [
    { x: "0.98462", y: 669389265.25 },
    { x: "0.98955", y: -10260195207.75 },
    { x: "0.98995", y: -9790325611.800293 },
    { x: "0.99044", y: -330204246861629.06 },
    { x: "0.99054", y: 456004597158796860 },
    { x: "0.99064", y: 1774474594738952400 },
    { x: "0.99074", y: 8079339462420436000 },
    { x: "0.99084", y: 47266407844196050000 },
    { x: "0.99094", y: 56835026639807635000 },
    { x: "0.99104", y: 56835026613535790000 },
    { x: "0.99114", y: 56927364124906380000 },
    { x: "0.99124", y: 62591220759704340000 },
    { x: "0.99134", y: 64022688494611650000 },
    { x: "0.99143", y: 64685802164815946000 },
    { x: "0.99153", y: 77944628794775520000 },
    { x: "0.99173", y: 77944580130608270000 },
    { x: "0.99193", y: 79799502781256000000 },
    { x: "0.99233", y: 82837311075914240000 },
    { x: "0.99243", y: 576959818662864550000 },
    { x: "0.99253", y: 577018364175174900000 },
    { x: "0.99263", y: 577052383864360670000 },
    { x: "0.99272", y: 577052363443927100000 },
    { x: "0.99282", y: 629223711320678700000 },
    { x: "0.99292", y: 629463201930561200000 },
    { x: "0.99302", y: 633320464011128100000 },
    { x: "0.99322", y: 633324705077616200000 },
    { x: "0.99342", y: 633328246754099000000 },
    { x: "0.99950", y: 633328246753429600000 },
    { x: "1.00451", y: 633328246764359100000 },
    { x: "1.00541", y: 633328576958815700000 },
    { x: "1.00551", y: 632872242157410000000 },
    { x: "1.00561", y: 631553772159829900000 },
    { x: "1.00571", y: 625248907292148500000 },
    { x: "1.00581", y: 586061838910372900000 },
    { x: "1.00591", y: 576493220114761300000 },
    { x: "1.00602", y: 576493220141033100000 },
    { x: "1.00612", y: 576400882629662540000 },
    { x: "1.00622", y: 570737025994864600000 },
    { x: "1.00632", y: 569305558259957300000 },
    { x: "1.00642", y: 568642444589753040000 },
    { x: "1.00652", y: 555383617959793460000 },
    { x: "1.00672", y: 555383666623960700000 },
    { x: "1.00692", y: 553528743973313000000 },
    { x: "1.00732", y: 550490935678654740000 },
    { x: "1.00742", y: 56368428091704410000 },
    { x: "1.00753", y: 56309882579394060000 },
    { x: "1.00763", y: 56275862890208320000 },
    { x: "1.00773", y: 56275883310641850000 },
    { x: "1.00783", y: 4104535433890234400 },
    { x: "1.00793", y: 3865044824007824000 },
    { x: "1.00803", y: 7782743440940544 },
    { x: "1.00823", y: 3541676952802385 },
    { x: "1.00843", y: 469995901 },
    { x: "1.00995", y: 126305.05029296875 },
  ];

  function convertToPath(
    points: {
      x: string;
      y: number;
    }[]
  ) {
    // ex path="20,20 40,25 60,40"
    // clamp y values between 0 and 100
    // use x values length to determine how many points to show

    let path = "";
    const xLength = points.length;
    const xSpace = 100 / xLength;

    // convert y values to 0-100% range
    const yValues = points.map((point) => point.y);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yRange = yMax - yMin;

    for (let i = 0; i < xLength; i++) {
      const y = points[i].y;
      let yClamped = 100 - ((yMax - y) / yRange) * 100;
      // invert yClamped value
      yClamped = 100 - yClamped;

      path += `${xSpace * (i + 1)},${yClamped} `;
    }
    return path;
  }

  React.useEffect(() => {
    if (!ref.current) return;

    const circle = ref.current;
    const offset = {
      x: 0,
      y: 0,
    };
    // move circle svg with mouse when dragged
    const onMouseMove = (e: MouseEvent) => {
      //   convert global mouse position to svg coordinates
      const pt = circle.ownerSVGElement?.createSVGPoint();
      if (!pt) return;
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        circle.ownerSVGElement.getScreenCTM()?.inverse()
      );

      //   move svg circle
      circle.setAttribute("cx", `${svgP.x - offset.x}`);
      circle.setAttribute("cy", `${svgP.y - offset.y}`);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = (e: MouseEvent) => {
      const pt = circle.ownerSVGElement?.createSVGPoint();
      if (!pt) return;
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        circle.ownerSVGElement.getScreenCTM()?.inverse()
      );
      //  offset = mouse position - circle position
      offset.x = svgP.x - Number(circle.getAttribute("cx"));
      offset.y = svgP.y - Number(circle.getAttribute("cy"));
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    circle.addEventListener("mousedown", onMouseDown);
  }, []);
  return (
    <div
      style={{
        backgroundColor: "red",
        width: "400px",
        height: "400px",
      }}
    >
      <svg viewBox="0 0 100 100">
        {/* <rect
          x="10"
          y="10"
          width="20%"
          height="20%"
          fill="pink"
          stroke="blue"
        />
        <circle
          cx="40"
          cy="25"
          r="16%"
          stroke="#222"
          className={styles.circle}
          ref={ref}
        /> */}

        {/* <polyline
          points="0,0 0,50 100,50 100,0 0,0"
          stroke="blue"
          fill="none"
          strokeWidth="1"
        /> */}

        <polyline
          points={convertToPath(points)}
          stroke="blue"
          fill="none"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

export default SVGComponent;
