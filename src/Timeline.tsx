import React from 'react';

interface Props {
    time: number;
    length: number;
    onChange?: (time: number) => void;
}

const Timeline: React.FC<Props> = props => {
    function handleMouse(event: React.MouseEvent) {
        if (!event.button && !event.buttons) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (props.onChange) {
            props.onChange((event.clientX - rect.left) / rect.width * props.length);
        }
    }

    return <div style={{ width: '100%', height: '30px', background: 'red', position: 'relative' }} onMouseDown={handleMouse} onMouseMove={handleMouse}>
        <span style={{ height: '100%', width: '1px', background: 'black', left: `${props.time / props.length * 100}%`, position: 'absolute' }} />
    </div>
};

export default Timeline;
