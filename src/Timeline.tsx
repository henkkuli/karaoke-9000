import React from 'react';

interface Props {
    time: number;
    length: number;
    onChange?: (time: number) => void;
}

const Timeline: React.FC<Props> = props => {
    function handleMove(event: React.MouseEvent) {
        const t = event.currentTarget;
        if (props.onChange) {
            props.onChange((event.clientX - t.clientLeft) / t.clientWidth * props.length);
        }
    }
    return <div style={{ width: '100%', height: '30px', background: 'red', position: 'relative' }} onMouseMove={handleMove}>
        <span style={{ height: '100%', width: '1px', background: 'black', left: `${props.time / props.length * 100}%`, position: 'absolute' }} />
    </div>
};

export default Timeline;
