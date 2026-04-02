import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

type Props = {
    children: React.ReactNode;
    delay?: number;      // ms delay before animation starts
    duration?: number;   // ms for the animation
    distance?: number;   // px to slide up from
    style?: StyleProp<ViewStyle>;
};

/**
 * Wraps children in a fade + slide-up entrance animation.
 * Use `delay` to stagger multiple items.
 */
export default function FadeSlideIn({
    children,
    delay = 0,
    duration = 350,
    distance = 20,
    style,
}: Props) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(distance)).current;

    useEffect(() => {
        const anim = Animated.parallel([
            Animated.spring(opacity, {
                toValue: 1,
                useNativeDriver: true,
                tension: 20,
                friction: 7,
                delay,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 25,
                friction: 6,
                delay,
            }),
        ]);
        anim.start();
        return () => anim.stop();
    }, []);

    return (
        <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
            {children}
        </Animated.View>
    );
}
