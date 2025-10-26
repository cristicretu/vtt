import { useCallback, useEffect, useState } from "react";

export function useDoubleCheck() {
	const [doubleCheck, setDoubleCheck] = useState(false);

	const getButtonProps = useCallback(
		(props?: { onClick?: () => void }) => {
			const onBlur = () => setDoubleCheck(false);

			const onClick = () => {
				if (doubleCheck) {
					props?.onClick?.();
				} else {
					setDoubleCheck(true);
				}
			};

			return {
				onBlur,
				onClick,
			};
		},
		[doubleCheck],
	);

	useEffect(() => {
		if (doubleCheck) {
			const timer = setTimeout(() => {
				setDoubleCheck(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [doubleCheck]);

	return { doubleCheck, getButtonProps };
}
