// src/components/common/Input.tsx
import React from 'react';
import { InputWrapper, StyledLabel, StyledInput } from './Input.styled';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <InputWrapper>
      <StyledLabel htmlFor={id}>{label}</StyledLabel>
      <StyledInput id={id} {...props} />
    </InputWrapper>
  );
};

export default Input;
