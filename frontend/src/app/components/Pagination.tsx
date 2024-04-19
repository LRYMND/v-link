const Pagination = ({ pages, colorActive, colorInactive, currentPage, dotSize = 20 }) => {
    const circles = [];

    for (let i = 0; i < pages; i++) {
        const isActive = i === currentPage;
        const circleColor = isActive ? colorActive : colorInactive;

        circles.push(
            <circle
                key={i}
                cx={(i * 2 + 1) * dotSize} // Position circles with a little spacing
                cy={dotSize}
                r={dotSize / 2}
                fill={circleColor}
            />
        );
    }

    const svgWidth = pages * dotSize * 2; // Adjust the width based on circle count
    const svgHeight = dotSize * 2; // Adjust the height based on circle size

    return (
        <>
            <svg width={svgWidth} height={svgHeight}>
                {circles}
            </svg>
        </>
    );
};

export default Pagination;