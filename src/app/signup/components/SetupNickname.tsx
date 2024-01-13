import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Cancel } from '@/components/common/icons';
import { Registration } from '../page';

const MIN_NICKNAME_LENGTH = 5;
const MAX_NICKNAME_LENGTH = 20;

type Nickname = Registration['nickname']['value'];

const SetupNickname = ({
  registration,
  handleRegistration,
  completeRegistration,
}: {
  registration: Registration;
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void;
  completeRegistration: () => void;
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    validate: (value: string) => boolean,
  ) => {
    const { value } = e.target;
    const error = validate(value) ? false : true;

    handleRegistration((prev) => ({ nickname: { ...prev.nickname, value, error } }));
  };

  const handleInputFocus = () => {
    handleRegistration((prev) => ({ nickname: { ...prev.nickname, focus: true } }));
  };

  const handleInputBlur = () => {
    handleRegistration((prev) => ({ nickname: { ...prev.nickname, focus: false } }));
  };

  const reset = () => {
    handleRegistration(() => ({ nickname: { value: '', error: false, focus: false } }));
  };

  const handleCTAButton = () => {
    completeRegistration();
  };

  const isValidInput = registration.nickname.value && !registration.nickname.error;

  return (
    <div className="grid h-full">
      <div>
        <Description />
        <div className="grid pt-[88px] h-full">
          <div>
            <Nickname
              registration={registration}
              handleInputChange={handleInputChange}
              handleInputFocus={handleInputFocus}
              handleInputBlur={handleInputBlur}
              reset={reset}
            />
          </div>
        </div>
      </div>
      {/** @TODO: 관심사, 성별 페이지 추가 후 버튼명 변경 */}
      <Button onClick={handleCTAButton} disabled={!isValidInput} className="self-end">
        가입완료
      </Button>
    </div>
  );
};

export default SetupNickname;

const Description = () => {
  return (
    <p className="font-semibold text-2xl">
      닉네임을
      <br />
      입력해주세요.
    </p>
  );
};

const Nickname = ({
  registration,
  handleInputChange,
  handleInputFocus,
  handleInputBlur,
  reset,
}: {
  registration: Registration;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    validate: (value: string) => boolean,
  ) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  reset: () => void;
}) => {
  const isValidLength = (nickname: Nickname) =>
    nickname.length >= MIN_NICKNAME_LENGTH && nickname.length <= MAX_NICKNAME_LENGTH;

  const isValidNoBlank = (nickname: Nickname) => !nickname.includes(' ');

  const isValidNickname = (nickname: Nickname) =>
    isValidLength(nickname) && isValidNoBlank(nickname);

  return (
    <Input
      type="text"
      id="nickname"
      placeholder="닉네임을 입력해주세요."
      value={registration.nickname.value}
      icon={registration.nickname.focus ? <Cancel id="cancel" onMouseDown={reset} /> : ''}
      error={registration.nickname.error && '공백없이 5~20자로 입력해주세요.'}
      onChange={(e) => handleInputChange(e, isValidNickname)}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
    />
  );
};
