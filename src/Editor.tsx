import React, { useState, useRef } from 'react';

interface Props {
    text: string;
    onChange: (value: string) => void;
    time: number | null;
}
const Editor: React.FC<Props> = props => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    function handleClick(e: React.MouseEvent<HTMLTextAreaElement>) {
        if (textareaRef.current && e.ctrlKey && props.time !== null) {
            const newText = `${props.text.substring(0, textareaRef.current.selectionStart)}{${props.time.toFixed(2)}}${props.text.substring(textareaRef.current.selectionStart)}`;
            props.onChange(newText);
        }
    }

    return <textarea value={props.text} onChange={e => props.onChange(e.target.value)} onClick={handleClick} ref={textareaRef}>
    </textarea>
}

export default Editor;