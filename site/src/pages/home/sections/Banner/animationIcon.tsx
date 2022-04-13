import React, { CSSProperties, useRef, useState, ReactElement, useLayoutEffect } from 'react';
import anime, { AnimeAnimParams, AnimeTimelineInstance } from 'animejs';
import cs from '../../utils/classNames';
import useIsFirstRender from '../../hooks/useIsFirstRender';

interface AnimationIconProps {
  style?: CSSProperties;
  className?: string | string[];
  icon: ReactElement;
  animation?: boolean; // 是否要播放动画
  onStart?: () => void; // 动画播放开始
  onComplete?: () => void; // 动画播放结束
}

const animationDuration = 500; // ms
const animationDelay = 4000;

function animationOut(
  target: NodeListOf<SVGPathElement>,
  config: AnimeAnimParams
): AnimeTimelineInstance {
  const timeline = anime.timeline({
    duration: animationDuration,
    easing: 'linear',
  });
  const delay = 600 / target.length;
  target.forEach((node) => {
    timeline.add(
      {
        targets: node,
        opacity: [1, 0],
        delay,
      },
      `-=${delay / 2}`
    );
  });
  timeline.complete = config.complete;
  return timeline;
}

function animationIn(
  target: NodeListOf<SVGPathElement>,
  config: AnimeAnimParams
): AnimeTimelineInstance {
  const timeline = anime.timeline({
    duration: animationDuration / 2,
    easing: 'linear',
  });
  const delay = 600 / target.length;
  target.forEach((node) => {
    timeline.add(
      {
        targets: node,
        opacity: [0, 1],
        delay,
      },
      `-=${delay / 2}`
    );
  });
  timeline.add({
    duration: animationDelay,
  });
  timeline.complete = config.complete;
  return timeline;
}

export default function AnimationIcon(props: AnimationIconProps) {
  const { style = {}, className, icon, animation, onStart, onComplete } = props;
  const isFirstRender = useIsFirstRender();
  const [Icon, setIcon] = useState(icon);
  const [updateKey, setUpdateKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const refAnimationInstance = useRef<AnimeTimelineInstance>();

  const completeAnimation = () => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current.seek(refAnimationInstance.current.duration);
    }
  };

  useLayoutEffect(() => {
    completeAnimation();
    if (!isFirstRender && animation) {
      const paths = ref.current.querySelectorAll('path');
      refAnimationInstance.current = animationOut(paths, {
        complete() {
          refAnimationInstance.current = null;
          setIcon(icon);
          setUpdateKey((pre) => pre + 1);
        },
      });
      onStart && onStart();
    } else {
      setIcon(icon);
    }
  }, [animation, icon]);

  useLayoutEffect(() => {
    completeAnimation();
    if (!isFirstRender) {
      const paths = ref.current.querySelectorAll('path');
      refAnimationInstance.current = animationIn(paths, {
        complete() {
          refAnimationInstance.current = null;
          onComplete && onComplete();
        },
      });
    }
  }, [updateKey]);

  return (
    <div ref={ref} style={style} className={cs(className)}>
      {Icon}
    </div>
  );
}
