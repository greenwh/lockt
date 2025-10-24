// src/components/common/Button.tsx
import React from 'react';
import { StyledButton } from './Button.styled';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
    return <StyledButton {...props}>{props.children}</StyledButton>;
};

export default Button;