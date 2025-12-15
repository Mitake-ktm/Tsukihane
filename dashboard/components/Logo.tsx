import React from 'react';

// Configuration for the logo
// To use a custom image:
// 1. Add your logo image to the /public folder (e.g. /public/logo.png)
// 2. Change LOGO_TYPE to 'image' below
// 3. Update IMAGE_PATH if your file name is different

type LogoType = 'emoji' | 'image';

const LOGO_CONFIG = {
    // Change this to 'image' to use your custom logo file
    type: 'emoji' as LogoType,

    // The emoji to use if type is 'emoji'
    emoji: '🌙',

    // The path to your image file (relative to public folder)
    imagePath: '/logo.png',

    // Accessibility text
    alt: 'Tsukihane Logo'
};

interface LogoProps {
    className?: string; // Additional classes
    style?: React.CSSProperties; // Inline styles
}

export default function Logo({ className, style }: LogoProps) {
    if (LOGO_CONFIG.type === 'image') {
        return (
            <img
                src={LOGO_CONFIG.imagePath}
                alt={LOGO_CONFIG.alt}
                className={className}
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    ...style
                }}
            />
        );
    }

    return (
        <span className={className} style={style}>
            {LOGO_CONFIG.emoji}
        </span>
    );
}
