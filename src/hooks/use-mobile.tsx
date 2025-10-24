import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
	const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
	const [isTouchDevice, setIsTouchDevice] = React.useState<boolean | undefined>(undefined);

	React.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const touchMql = window.matchMedia("(hover: none) and (pointer: coarse)");

		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};

		const onTouchChange = () => {
			setIsTouchDevice(touchMql.matches);
		};

		mql.addEventListener("change", onChange);
		touchMql.addEventListener("change", onTouchChange);

		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		setIsTouchDevice(touchMql.matches);

		return () => {
			mql.removeEventListener("change", onChange);
			touchMql.removeEventListener("change", onTouchChange);
		};
	}, []);

	return {
		isMobile: !!isMobile,
		isTouchDevice: !!isTouchDevice,
	};
}
