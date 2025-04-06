import React from "react";

const Button = ({
  children,
  // ⬇️ This is the default classname of the component (ced will set up this)
  className = "p-1 border border-gray-500 bg-[#B3E5FC] w-[682px] h-[70px] rounded-md border-none",
  // ⬇️ This is the additional classname if you have specific adjustment when you use the component
  additionalClassName,
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
