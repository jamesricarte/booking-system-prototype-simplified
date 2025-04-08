import React from "react";

const Input = ({
  type,
  name,
  value,
  defaultValue,
  placeholder,
  checked,
  defaultChecked,
  onChange,
  onFocus,
  onBlur,
  onInput,
  onKeyDown,
  onKeyUp,
  onKeyPress,
  onClick,
  disabled,
  readOnly,
  required,
  autoComplete,
  autoFocus,
  maxLength,
  minLength,
  pattern,
  size,
  step,
  min,
  max,
  multiple,
  list,
  accept,
  ref,
  ariaLabel,
  ariaLabelledby,
  dataId,
  dataValue,
  // ⬇️ This is the default classname of the component (ced will set up this)
  className = "px-4 py-3 rounded-md border-gray-500 w-full h-auto bg-[#EFEFEF] text-[#595959] border-none",
  style,
  // ⬇️ This is the additional classname if you have specific adjustment when you use the component
  additionalClassName,
}) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onInput={onInput}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onKeyPress={onKeyPress}
      onClick={onClick}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      maxLength={maxLength}
      minLength={minLength}
      pattern={pattern}
      size={size}
      step={step}
      min={min}
      max={max}
      multiple={multiple}
      list={list}
      accept={accept}
      ref={ref}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      data-id={dataId}
      data-value={dataValue}
      className={`${className} ${additionalClassName}`}
      style={style}
    />
  );
};

export default Input;
