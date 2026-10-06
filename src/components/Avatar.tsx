import Image from 'next/image';

export default function Avatar({ name, image, size = 32 }: { name?: string | null; image?: string | null; size?: number }) {
    if (image) {
        return (
            <Image
                src={image}
                alt=""
                width={size}
                height={size}
                className="rounded-full bg-surface-2 object-cover"
                style={{ width: size, height: size }}
            />
        );
    }
    return (
        <span
            className="grid place-items-center rounded-full bg-surface-2 font-medium text-muted"
            style={{ width: size, height: size, fontSize: size * 0.42 }}
            aria-hidden="true"
        >
            {name?.trim().charAt(0).toUpperCase() || '?'}
        </span>
    );
}
