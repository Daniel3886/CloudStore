import type React from "react"
import { useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { getErrorMessage } from "@/lib/api/client"
import { hasErrors, VALIDATION_LIMITS, type FieldErrors, type ValidationErrorKey } from "@/lib/validation"

export function useAuthForm<Values extends Record<string, string>>(initialValues: Values) {
  type Field = keyof Values & string

  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const tValidation = useTranslations("common.validation")

  const setValue = useCallback((field: Field, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    setFormError("")
  }, [])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.name as Field, event.target.value),
    [setValue],
  )

  const validate = useCallback((nextErrors: FieldErrors<Field>) => {
    setErrors(nextErrors)
    return !hasErrors(nextErrors)
  }, [])

  const errorFor = useCallback(
    (field: Field) => {
      const key: ValidationErrorKey | undefined = errors[field]
      return key ? tValidation(key, VALIDATION_LIMITS) : undefined
    },
    [errors, tValidation],
  )

  const run = useCallback(async (action: () => Promise<void>, fallbackMessage: string) => {
    setFormError("")
    setIsSubmitting(true)
    try {
      await action()
    } catch (error) {
      setFormError(getErrorMessage(error, fallbackMessage))
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { values, setValue, handleChange, validate, errorFor, formError, setFormError, isSubmitting, run }
}
