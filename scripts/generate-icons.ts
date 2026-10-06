// Regenerates the favicon and app icons in public/ from the "td" brand mark.
// Run with `npm run icons` after changing the logo.
import fs from 'fs';
import path from 'path';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/og';

const ACCENT = '#f7b955';
const ACCENT_FG = '#1c1406';
const font = fs.readFileSync(path.join(__dirname, '../src/assets/fonts/JetBrainsMono-700.ttf'));
const out = path.join(__dirname, '../public');

// `inset` leaves a safe zone for maskable icons, which platforms crop to a circle.
function mark(size: number, { inset = 0, rounded = true } = {}) {
    const inner = size - inset * 2;
    return h(
        'div',
        { style: { width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: inset ? ACCENT : 'transparent' } },
        h(
            'div',
            {
                style: {
                    width: inner,
                    height: inner,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: ACCENT,
                    color: ACCENT_FG,
                    borderRadius: rounded ? inner * 0.22 : 0,
                    fontFamily: 'JetBrains Mono',
                    fontSize: inner * 0.5,
                    letterSpacing: -inner * 0.02,
                    paddingBottom: inner * 0.04,
                },
            },
            'td',
        ),
    );
}

async function png(size: number, opts?: Parameters<typeof mark>[1]): Promise<Buffer> {
    const res = new ImageResponse(mark(size, opts), {
        width: size,
        height: size,
        fonts: [{ name: 'JetBrains Mono', data: font, weight: 700, style: 'normal' }],
    });
    return Buffer.from(await res.arrayBuffer());
}

// ICO container holding PNG images (supported by all current browsers).
function ico(images: { size: number; data: Buffer }[]): Buffer {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(images.length, 4);
    let offset = 6 + images.length * 16;
    const entries = images.map(({ size, data }) => {
        const entry = Buffer.alloc(16);
        entry.writeUInt8(size >= 256 ? 0 : size, 0);
        entry.writeUInt8(size >= 256 ? 0 : size, 1);
        entry.writeUInt16LE(1, 4); // colour planes
        entry.writeUInt16LE(32, 6); // bits per pixel
        entry.writeUInt32LE(data.length, 8);
        entry.writeUInt32LE(offset, 12);
        offset += data.length;
        return entry;
    });
    return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function main() {
    const write = (name: string, data: Buffer) => {
        fs.writeFileSync(path.join(out, name), data);
        console.log(`wrote public/${name} (${data.length} bytes)`);
    };

    const sizes = [16, 32, 48];
    const small = await Promise.all(sizes.map(async (size) => ({ size, data: await png(size) })));
    write('favicon.ico', ico(small));
    write('icon-192.png', await png(192));
    write('icon-512.png', await png(512));
    write('icon-maskable-512.png', await png(512, { inset: 80, rounded: false }));
    // iOS applies its own rounded mask and ignores transparency.
    write('apple-touch-icon.png', await png(180, { rounded: false }));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
