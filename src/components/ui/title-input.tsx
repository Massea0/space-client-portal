import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Variants for the TitleInput using CVA
const titleInputVariants = cva(
  "w-full bg-transparent border-0 outline-none resize-none overflow-hidden transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default: "text-gray-70 focus:text-gray-90 placeholder:text-gray-40",
        h1: "text-gray-90 font-semibold text-2xl leading-tight focus:text-primary",
        h2: "text-gray-80 font-semibold text-xl leading-tight focus:text-primary",
        h3: "text-gray-70 font-medium text-lg leading-tight focus:text-primary",
        subtitle: "text-gray-60 font-normal text-base leading-relaxed focus:text-gray-70",
      },
      state: {
        view: "cursor-pointer hover:bg-gray-5 rounded px-2 py-1 -mx-2 -my-1",
        edit: "cursor-text border-b-2 border-primary bg-gray-5 px-2 py-1 rounded-t",
        error: "border-b-2 border-error bg-error/5 px-2 py-1 rounded-t",
        success: "border-b-2 border-success bg-success/5 px-2 py-1 rounded-t",
      },
    },
    defaultVariants: {
      variant: "default",
      state: "view",
    },
  }
)

interface TitleInputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>,
    VariantProps<typeof titleInputVariants> {
  value?: string
  onValueChange?: (value: string) => void
  onSave?: (value: string) => void
  onCancel?: () => void
  autoFocus?: boolean
  selectAllOnFocus?: boolean
  saveOnBlur?: boolean
  saveOnEnter?: boolean
  minRows?: number
  maxRows?: number
  errorMessage?: string
  successMessage?: string
}

const TitleInput = React.forwardRef<HTMLTextAreaElement, TitleInputProps>(
  (
    {
      className,
      variant,
      state: propState,
      value = "",
      onValueChange,
      onSave,
      onCancel,
      placeholder = "Cliquez pour éditer...",
      autoFocus = true,
      selectAllOnFocus = true,
      saveOnBlur = true,
      saveOnEnter = true,
      minRows = 1,
      maxRows = 5,
      errorMessage,
      successMessage,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value)
    const [isEditing, setIsEditing] = React.useState(false)
    const [originalValue, setOriginalValue] = React.useState(value)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    
    // Determine the actual state
    const actualState = propState || (
      errorMessage ? "error" : 
      successMessage ? "success" : 
      isEditing ? "edit" : "view"
    )

    // Sync external value changes
    React.useEffect(() => {
      setInternalValue(value)
      setOriginalValue(value)
    }, [value])

    // Auto-resize functionality
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      // Reset height to auto to get the actual scroll height
      textarea.style.height = 'auto'
      
      // Calculate the number of lines
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10)
      const lines = Math.ceil(textarea.scrollHeight / lineHeight)
      
      // Constrain between min and max rows
      const constrainedLines = Math.max(minRows, Math.min(maxRows, lines))
      const newHeight = constrainedLines * lineHeight
      
      textarea.style.height = `${newHeight}px`
    }, [minRows, maxRows])

    // Handle value changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      onValueChange?.(newValue)
      
      // Adjust height after value change
      requestAnimationFrame(adjustHeight)
    }

    // Handle entering edit mode
    const handleClick = () => {
      if (!isEditing) {
        setIsEditing(true)
        setOriginalValue(internalValue)
        
        // Focus and select all after state change
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.focus()
            if (selectAllOnFocus) {
              textareaRef.current.select()
            }
          }
          adjustHeight()
        })
      }
    }

    // Handle save
    const handleSave = React.useCallback(() => {
      if (isEditing) {
        setIsEditing(false)
        onSave?.(internalValue.trim())
      }
    }, [isEditing, internalValue, onSave])

    // Handle cancel
    const handleCancel = React.useCallback(() => {
      if (isEditing) {
        setInternalValue(originalValue)
        setIsEditing(false)
        onValueChange?.(originalValue)
        onCancel?.()
      }
    }, [isEditing, originalValue, onValueChange, onCancel])

    // Handle key press events
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      } else if (e.key === 'Enter' && saveOnEnter) {
        if (!e.shiftKey) {
          e.preventDefault()
          handleSave()
        }
      }
      
      props.onKeyDown?.(e)
    }

    // Handle blur events
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (saveOnBlur && isEditing) {
        // Small delay to allow for other interactions
        setTimeout(() => {
          handleSave()
        }, 100)
      }
      
      props.onBlur?.(e)
    }

    // Auto-focus effect
    React.useEffect(() => {
      if (isEditing && autoFocus && textareaRef.current) {
        textareaRef.current.focus()
        if (selectAllOnFocus) {
          textareaRef.current.select()
        }
      }
    }, [isEditing, autoFocus, selectAllOnFocus])

    // Initial height adjustment
    React.useEffect(() => {
      adjustHeight()
    }, [adjustHeight])

    return (
      <div className="relative">
        <textarea
          ref={(node) => {
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
            textareaRef.current = node
          }}
          className={cn(titleInputVariants({ variant, state: actualState }), className)}
          value={internalValue}
          onChange={handleChange}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={isEditing ? placeholder : internalValue || placeholder}
          readOnly={!isEditing && !propState}
          rows={minRows}
          {...props}
        />
        
        {/* Error message */}
        {errorMessage && actualState === "error" && (
          <div className="mt-1 text-xs text-error animate-in slide-in-from-top-1 duration-200">
            {errorMessage}
          </div>
        )}
        
        {/* Success message */}
        {successMessage && actualState === "success" && (
          <div className="mt-1 text-xs text-success animate-in slide-in-from-top-1 duration-200">
            {successMessage}
          </div>
        )}
        
        {/* Edit mode indicators */}
        {isEditing && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-50 animate-in slide-in-from-top-1 duration-200">
            <span>Échap pour annuler</span>
            <span>•</span>
            <span>Entrée pour sauvegarder</span>
          </div>
        )}
      </div>
    )
  }
)

TitleInput.displayName = "TitleInput"

export { TitleInput, titleInputVariants }
export type { TitleInputProps }
