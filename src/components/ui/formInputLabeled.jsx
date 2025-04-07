import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

/**
 * Renderiza un campo de entrada con etiqueta, icono opcional y mensaje de error.
 *
 * Este componente de React utiliza un objeto de configuración para renderizar un campo de entrada estilizado,
 * acompañado de una etiqueta y, opcionalmente, un icono importado dinámicamente desde "lucide-react". Si se
 * especifica un 'iconName' en las propiedades de icono, se intenta importar y renderizar el icono correspondiente.
 * Además, se muestra un mensaje de error debajo del campo si se proporciona 'trackedErrors'.
 *
 * @param {Object} props - Objeto de propiedades del componente.
 * @param {Object} [props.attributes={}] - Objeto de configuración con propiedades para personalizar el componente:
 *   - outerContainerClassName {string}: Clase CSS para el contenedor exterior.
 *   - labelAttributes {Object}: Propiedades para la etiqueta, incluyendo:
 *       - className {string}: Clase CSS para la etiqueta.
 *       - text {string}: Texto a mostrar en la etiqueta (se muestra "Sin Contenido" si no se especifica).
 *   - innerContainerClassName {string}: Clase CSS para el contenedor interior.
 *   - iconAttributes {Object}: Propiedades para el icono opcional, incluyendo:
 *       - iconName {string}: Nombre del icono a importar desde "lucide-react".
 *       - className {string}: Clase CSS adicional para el icono.
 *       - size {number}: Tamaño del icono (por defecto 18).
 *   - inputAttributes {Object}: Propiedades para el campo de entrada, tales como:
 *       - id {string}: Identificador del campo.
 *       - type {string}: Tipo de entrada (por defecto "text").
 *       - name {string}: Nombre del campo.
 *       - value {string}: Valor actual del campo (por defecto cadena vacía).
 *       - onChange {function}: Manejador del evento de cambio.
 *       - onFocus {function}: Manejador del evento de enfoque.
 *       - onBlur {function}: Manejador del evento de desenfoque.
 *       - className {string}: Clase CSS adicional para el input.
 *       - placeholder {string}: Texto de marcador de posición.
 *       - pattern {string}: Patrón de validación.
 *       - disabled {boolean}: Indica si el campo está deshabilitado.
 *       - required {boolean}: Indica si el campo es obligatorio.
 *   - additionalElement {JSX.Element|string}: Elemento adicional a renderizar junto al campo.
 *   - trackedErrors {string}: Mensaje de error a mostrar si existe un error.
 *   - cssStyles {Object|string}: Estilos en línea para el contenedor exterior.
 *
 * @returns {JSX.Element} Fragmento de React que contiene el campo de entrada con su etiqueta, icono (si está disponible) y mensaje de error opcional.
 */
function InputLabeled({ attributes = {} }) {
  const {
    outerContainerClassName = "",
    labelAttributes = {},
    innerContainerClassName = "",
    iconAttributes = {},
    inputAttributes = {},
    additionalElement = "",
    trackedErrors = undefined,
    cssStyles = ""
  } = attributes;
  const {
    iconName,
    className: iconClassName = "",
    size: iconSize = 18,
  } = iconAttributes;

  const {
    id,
    type = "text",
    name,
    value = "",
    onChange,
    onFocus,
    onBlur,
    className: inputClassName = "",
    placeholder = "",
    pattern = "",
    disabled = false,
    required = false,
  } = inputAttributes;

  const [ImportedIcon, setImportedIcon] = useState(null);

  useEffect(() => {
    if (iconName) {
      import("lucide-react")
        .then((module) => setImportedIcon(() => module[iconName]))
        .catch((e) =>
          console.error(`Error al cargar el icono ${iconName}:`, e)
        );
    }
  }, [iconName]);

  return (
    <>
      <div
        className={outerContainerClassName}
        {...(cssStyles && Object.keys(cssStyles).length > 0
          ? { style: cssStyles }
          : {})}
      >
        <Label htmlFor={id || type} className={labelAttributes.className}>
          {labelAttributes.text || "Sin Contenido"}
        </Label>
        <div className={innerContainerClassName}>
          {ImportedIcon && (
            <ImportedIcon
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#6b5ffd] transition-colors duration-200 ${iconClassName}`}
              size={iconSize}
            />
          )}
          <input
            id={id || type}
            type={type}
            name={name || id || type}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className={`w-full py-2.5 px-4 pl-9 bg-[#3a3a4e] rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#7c3aed] hover:bg-[#434360] ${inputClassName}`}
            placeholder={placeholder}
            {...(pattern ? { pattern } : {})}
            disabled={disabled}
            required={required}
          />
          {additionalElement}
        </div>
      </div>
      {trackedErrors && (
        <p className="text-red-500 text-xs mt-1 text-left">{trackedErrors}</p>
      )}
    </>
  );
}

export default InputLabeled;
