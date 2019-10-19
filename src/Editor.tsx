import React, { useState, useRef } from 'react';
import styled from 'styled-components';

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

    return <StyledTextarea value={props.text} onChange={e => props.onChange(e.target.value)} onClick={handleClick} ref={textareaRef} />;
}

const StyledTextarea = styled.textarea`
    width: 100%;
    height: 100%;
    resize: none;
`;

export default Editor;