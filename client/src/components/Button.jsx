import React from "react";

const Button = ({
  children,
  className = "p-1 border border-gray-500",
  id,
  style,
  title,
  lang,
  dir,
  hidden,
  tabIndex,
  accessKey,
  draggable,
  spellCheck,
  translate,
  type,
  disabled,
  autoFocus,
  name,
  value,
  form,
  formAction,
  formEncType,
  formMethod,
  formNoValidate,
  formTarget,
  additionalClassName,
  defaultValue,
  required,
  readOnly,
  placeholder,
  onClick,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onKeyPress,
  ref,
  autoComplete,
  list,
  pattern,
  maxLength,
  minLength,
  size,
}) => {
  return (
    <button
      className={`${className} ${additionalClassName}`}
      id={id}
      style={style}
      title={title}
      lang={lang}
      dir={dir}
      hidden={hidden}
      tabIndex={tabIndex}
      accessKey={accessKey}
      draggable={draggable}
      spellCheck={spellCheck}
      translate={translate}
      type={type}
      disabled={disabled}
      autoFocus={autoFocus}
      name={name}
      value={value}
      form={form}
      formAction={formAction}
      formEncType={formEncType}
      formMethod={formMethod}
      formNoValidate={formNoValidate}
      formTarget={formTarget}
      defaultValue={defaultValue}
      required={required}
      readOnly={readOnly}
      placeholder={placeholder}
      onClick={onClick}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onKeyPress={onKeyPress}
      ref={ref}
      autoComplete={autoComplete}
      list={list}
      pattern={pattern}
      maxLength={maxLength}
      minLength={minLength}
      size={size}
    >
      {children}
    </button>
  );
};

export default Button;
