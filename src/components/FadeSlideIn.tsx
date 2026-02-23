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
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
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
