import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
	const [isMobile, setIsMobile] = React.useState<boolean>(() => {
		// Initialize with correct value on first render to prevent layout shift
		if (typeof window !== "undefined") {
			return window.innerWidth < MOBILE_BREAKPOINT;
		}
		return false;
	});

	React.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};

		mql.addEventListener("change", onChange);

		// Update state in case it changed between initial render and effect
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

		return () => {
			mql.removeEventListener("change", onChange);
		};
	}, []);

	return isMobile;
}
