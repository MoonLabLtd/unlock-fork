import { Button, Input } from '@unlock-protocol/ui'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import {
  FieldErrorsImpl,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// TODO: move to zod config when supported there!
export const LabelMapping: Record<string, string> = {
  name: 'Name',
  network: 'Network',
  lock: 'Lock',
  title: 'Title',
  icon: 'Image icon',
  persistentCheckout: 'Persistent Checkout',
  referrer: 'Referrer',
  messageToSign: 'Message to sign',
  pessimistic: 'Pessimistic',
  hideSoldOut: 'Hide Sold-out',
  type: 'Type',
  placeholder: 'Placeholder text',
  defaultValue: 'Default value',
  required: 'Required',
  public: 'Shown as public',
  recurringPayments: 'Recurring frequency',
  minRecipients: 'Minimum number of recipients',
  maxRecipients: 'Maximum number of Recipients',
  password: 'Password Required',
  promo: 'Promo Codes',
  captcha: 'Captcha',
  emailRequired: 'Collect email address',
  superfluid: 'Enable Superfluid',
  default: 'Default',
  dataBuilder: 'Data builder',
  redirectUri: 'Redirect URL',
  skipRecipient: 'Skip Recipient',
}

interface DynamicFormProps {
  name: string
  schema: z.Schema
  title?: string
  description?: React.ReactNode
  onChange: (fields: any) => void
  onSubmit?: (fields: any) => void
  submitLabel?: string
  defaultValues?: any
  showSubmit?: boolean
}

interface ComponentByTypeMapProps {
  [type: string]: any
}

interface FieldProps {
  required?: boolean
  label?: string
  type: string
  name: string
  description?: string
  props: Record<string, any>
  errors?: Partial<FieldErrorsImpl<any>>
}

export const ConnectForm = ({ children }: any) => {
  const methods = useFormContext()

  return children({ ...methods })
}

const TextInput = ({ props, type, errors, ...rest }: FieldProps) => {
  const { enum: enumList = [] } = props ?? {}
  const hasOptions = enumList?.length
  const isNumericField =
    (Array.isArray(props.type) && props.type.includes('number')) ||
    type === 'number'
  const inputType = isNumericField ? 'number' : type

  const error = errors?.[rest.name] ? errors?.[rest.name]?.message : ''

  if (!hasOptions) {
    return (
      <ConnectForm>
        {({ register }: any) => (
          <Input
            type={inputType}
            {...register(rest.name, {
              valueAsNumber: isNumericField,
            })}
            {...rest}
            error={error}
          />
        )}
      </ConnectForm>
    )
  }

  const options = enumList.map((enumItem: string) => ({
    label: enumItem,
    value: enumItem,
  }))

  return (
    <>
      <ConnectForm>
        {({ register }: any) => (
          <select
            className="block w-full box-border rounded-lg transition-all shadow-sm border bg-black border-gray-400 hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none flex-1 disabled:bg-gray-100 pl-2.5 py-1.5 text-sm"
            {...register(rest.name)}
            {...rest}
          >
            {options?.map(({ label, value }: any) => (
              <option key={label} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
      </ConnectForm>
      <span className="text-xs text-gray-200 ">{rest.description}</span>
    </>
  )
}

const BooleanInput = ({ props, name, label, ...rest }: any) => {
  return (
    <div className="block gap-3 py-2 ">
      <ConnectForm>
        {({ register }: any) => (
          <>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={name}
                  name={name}
                  className="cursor-pointer focus:outline-0 hover:outline-0 outline-0 focus:ring-transparent"
                  {...register(name)}
                />
                <label htmlFor={name}>{label}</label>
              </div>
              {rest?.description && (
                <span className="text-xs text-gray-200 ">
                  {rest?.description}
                </span>
              )}
            </div>
          </>
        )}
      </ConnectForm>
    </div>
  )
}

const ComponentByTypeMap: ComponentByTypeMapProps = {
  string: TextInput,
  integer: TextInput,
  boolean: BooleanInput,
}

const TypeMap: Record<string, string> = {
  string: 'text',
  integer: 'number',
}

const getFieldLabel = (fieldName: string, required = false) => {
  const label = LabelMapping?.[fieldName] ?? fieldName
  return required ? `*${label}` : label
}

const getComponentByType = (type: string) => {
  // return Input component based on input type
  return ComponentByTypeMap?.[type] ?? undefined
}

export const DynamicForm = ({
  name,
  description,
  schema,
  onChange,
  submitLabel = 'Next',
  onSubmit: onSubmitCb,
  defaultValues,
  showSubmit = false,
  title,
}: DynamicFormProps) => {
  const { properties = {}, required = [] } =
    (zodToJsonSchema(schema, name).definitions?.[name] as any) ?? {}

  const methods = useForm<z.infer<typeof schema>>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  })

  const { errors } = methods.formState

  const onSubmit = (fields: z.infer<typeof schema>) => {
    if (typeof onSubmitCb === 'function') {
      onSubmitCb(fields)
    }
  }

  return (
    <div className="flex flex-col gap-3 pb-6">
      {description && <>{description}</>}
      <FormProvider {...methods}>
        {title && (
          <h2 className="mb-2 text-lg font-bold text-white">{title}</h2>
        )}
        <form
          className="flex flex-col gap-3 outline-none"
          onSubmit={methods.handleSubmit(onSubmit)}
          onChange={() => {
            onChange(methods.getValues())
          }}
        >
          {Object.entries(properties ?? {}).map(([fieldName, props], index) => {
            const { type = undefined, description = '' } = (props as any) || {}
            let Component = getComponentByType(type)
            let inputType: string = TypeMap?.[type] || type
            const fieldRequired = required.includes(fieldName)

            const isUnionType =
              Array.isArray(type) &&
              (type.includes('string') || type.includes('number'))

            if (isUnionType) {
              inputType = TypeMap.string
              Component = ComponentByTypeMap.string
            }

            if (type === 'array') {
              return (
                <div
                  key="array"
                  className="grid items-center grid-cols-1 gap-2 p-4 bg-gray-200 rounded-xl"
                >
                  {Object.entries((props as any)?.items?.properties ?? {})?.map(
                    ([name, fieldProps], index) => {
                      const { type, description } = (fieldProps ?? {}) as any
                      Component = getComponentByType(type)
                      if (!Component) return null
                      return (
                        <>
                          <Component
                            type={type}
                            key={index}
                            size="small"
                            label={getFieldLabel(name, fieldRequired)}
                            name={name}
                            description={description}
                            props={fieldProps}
                            schema={schema}
                            errors={errors}
                          />
                        </>
                      )
                    }
                  )}
                </div>
              )
            }

            if (!Component) return null

            return (
              <div className="flex flex-col gap-2" key={index}>
                <Component
                  props={props}
                  label={getFieldLabel(fieldName, fieldRequired)}
                  type={inputType}
                  name={fieldName}
                  required={fieldRequired}
                  description={description}
                  size="small"
                  schema={schema}
                  errors={errors}
                />
              </div>
            )
          })}

          {showSubmit && (
            <div className="flex mt-2">
              <div className="ml-auto">
                <Button type="submit">{submitLabel}</Button>
              </div>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  )
}
