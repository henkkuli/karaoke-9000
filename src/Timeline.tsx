import React from 'react';

interface Props {
    time: number;
    length: number;
    onChange: (time: number) => void;
}

const Timeline: React.FC<Props> = props => {
    function handleMove(event: React.MouseEvent) {
        const t = event.currentTarget;
        props.onChange((event.clientX - t.clientLeft) / t.clientWidth * props.length);
    }
    return <div style={{ width: '100%', height: '30px', background: 'red' }} onMouseMove={handleMove} />
};

export default Timeline;
