import React from 'react';
import { Control, Controller, FieldError, FieldValues, Path } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

// Enhanced FormField that integrates with React Hook Form
interface FormFieldProps {
  label: string;
  required?: boolean;
  tooltip?: string;
  error?: FieldError;
  children: React.ReactNode;
}

export function FormField({ label, required, tooltip, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {tooltip && (
          <div className="group relative inline-block ml-2">
            <AlertCircle className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg transition-all duration-200 w-64">
              {tooltip}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error.message}
        </p>
      )}
    </div>
  );
}

// Controlled Input Component with local state
interface ControlledInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  tooltip?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  onUpdate?: () => void;
}

export function ControlledInput<T extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  required,
  tooltip,
  min,
  max,
  step,
  onUpdate
}: ControlledInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const [localValue, setLocalValue] = React.useState(field.value || '');

        // Update local value when field value changes externally
        React.useEffect(() => {
          setLocalValue(field.value || '');
        }, [field.value]);

        return (
          <FormField label={label} required={required} tooltip={tooltip} error={error}>
            <input
              type={type}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-primary-500'
              }`}
              value={localValue}
              onChange={(e) => {
                setLocalValue(e.target.value);
              }}
              onBlur={(e) => {
                const value = type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value;
                field.onChange(value);
                field.onBlur();
                
                // Trigger parent update if callback provided
                if (onUpdate) {
                  onUpdate();
                }
              }}
            />
          </FormField>
        );
      }}
    />
  );
}

// Controlled Select Component
interface ControlledSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  tooltip?: string;
  onUpdate?: () => void;
}

export function ControlledSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  required,
  tooltip,
  onUpdate
}: ControlledSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormField label={label} required={required} tooltip={tooltip} error={error}>
          <select
            {...field}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
              error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-primary-500'
            }`}
            onChange={(e) => {
              field.onChange(e.target.value);
              
              // Trigger parent update if callback provided
              if (onUpdate) {
                onUpdate();
              }
            }}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      )}
    />
  );
}

// Controlled Date Input Component
interface ControlledDateInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  tooltip?: string;
  onUpdate?: () => void;
}

export function ControlledDateInput<T extends FieldValues>({
  name,
  control,
  label,
  required,
  tooltip,
  onUpdate
}: ControlledDateInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const [localValue, setLocalValue] = React.useState('');

        // Update local value when field value changes externally
        React.useEffect(() => {
          if (field.value && typeof field.value === 'object' && 'toLocaleDateString' in field.value) {
            setLocalValue((field.value as Date).toLocaleDateString('en-US'));
          } else {
            setLocalValue(field.value || '');
          }
        }, [field.value]);

        return (
          <FormField label={label} required={required} tooltip={tooltip} error={error}>
            <input
              type="text"
              placeholder="MM/DD/YYYY"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-primary-500'
              }`}
              value={localValue}
              onChange={(e) => {
                setLocalValue(e.target.value);
              }}
              onBlur={(e) => {
                const dateValue = e.target.value;
                if (dateValue) {
                  const parsedDate = new Date(dateValue);
                  if (!isNaN(parsedDate.getTime())) {
                    const year = parsedDate.getFullYear();
                    if (year >= 1970 && year <= 2030) {
                      field.onChange(parsedDate);
                    } else {
                      field.onChange(dateValue); // Keep invalid for validation
                    }
                  } else {
                    field.onChange(dateValue); // Keep invalid for validation
                  }
                } else {
                  field.onChange(undefined);
                }
                field.onBlur();
                
                // Trigger parent update if callback provided
                if (onUpdate) {
                  onUpdate();
                }
              }}
            />
          </FormField>
        );
      }}
    />
  );
}