import React, { ChangeEvent, FormEvent, useState } from 'react';

interface CodeMetadataProps {
  entity: string;
  code: string;
  handleAction: (code: string, file: string, action: string) => void;
}
const CodeMetadata: React.FC<CodeMetadataProps> = ({ entity, code, handleAction }) => {
  const formKey = Math.floor(Math.random() * 10001);
  const codeWithoutFileType = code.split('\n').slice(1).join('\n');
  const fileTypes = codeWithoutFileType.match(/ruby|python|javascript|bash|json|html|css/);
  const fileType = fileTypes ? fileTypes[0] : undefined;

  const [textareaValue, setTextareaValue] = useState(code); // Added state for textarea code

  const files = [
    `app/models/${entity.toLowerCase()}.rb`,
    `app/controllers/${entity.toLowerCase()}s_controller.rb`,
    `app/views/${entity.toLowerCase()}s/index.html.erb`,
    `app/views/${entity.toLowerCase()}s/show.html.erb`,
    'config/routes.rb'
  ];
  const [selectedFile, setSelectedFile] = useState(files[0]);
  const actions = ['replace', 'append', 'execute'];
  const [selectedAction, setSelectedAction] = useState(actions[0]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleAction(textareaValue, selectedFile, selectedAction);
  };
  return (
    <form onSubmit={handleSubmit}>
      <textarea
        name="code"
        value={textareaValue} // Updated value to use textareaValue
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setTextareaValue(e.target.value) // Updated state with setTextareaValue
        }
      />

      <select name="file" value={selectedFile} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedFile(e.target.value)}>
        {files.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <select name="chat_action" value={selectedAction} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedAction(e.target.value)}>
        {actions.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <input type="submit" value="Insertar" />
    </form>
  );
};
export default CodeMetadata;