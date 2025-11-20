"use client";
import React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
	fallbackSrc?: string;
};

export default function ImageWithFallback({
	src,
	alt,
	fallbackSrc = "/placeholder-image.svg",
	onError,
	...rest
}: Props) {
	const [currentSrc, setCurrentSrc] = React.useState(src);
	const [errored, setErrored] = React.useState(false);

	React.useEffect(() => {
		setCurrentSrc(src);
		setErrored(false);
	}, [src]);

	const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		if (!errored) {
			setErrored(true);
			setCurrentSrc(fallbackSrc);
		}
		onError?.(e);
	};

	return (
		<img src={String(currentSrc)} alt={alt} onError={handleError} {...rest} />
	);
}
