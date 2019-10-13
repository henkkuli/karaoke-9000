import React, { useState } from 'react';

import EventBoard from './EventBoard';
import Project from './Project';

interface Props {
    text: string;
    onChange: (value: string) => void;
}
const Editor: React.FC<Props> = props => {
    return <textarea value={props.text} onChange={e => props.onChange(e.target.value)}>
    </textarea>
}

export default Editor;