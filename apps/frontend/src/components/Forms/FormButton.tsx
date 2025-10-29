// interfaces
interface IProps {
  text: string;
  disabled?: boolean;
}

const FormButton: React.FC<IProps> = ({ text, disabled = false }) => (
  <button type='submit' className='button button-purple button-medium' disabled={disabled}>
    {text}
  </button>
);

export default FormButton;
