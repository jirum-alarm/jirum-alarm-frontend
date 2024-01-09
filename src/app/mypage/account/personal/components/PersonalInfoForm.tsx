'use client'
import Button from '@/components/common/Button'
import GenderRadioGroup from './GenderRadioGroup'
import BirthYearSelect from './BirthYearSelect'
import usePersonalInfoFormViewModel from '../hooks/usePersonalInfoFormViewModel'

const PersonalInfoForm = () => {
  const {
    birthYear,
    gender,
    handleSubmit,
    handleSelectChange,
    handleRadioChange,
    isValidPersonalInfoInput,
  } = usePersonalInfoFormViewModel()
  return (
    <form className="flex-1 flex flex-col justify-between pt-[88px]" onSubmit={handleSubmit}>
      <div>
        <BirthYearSelect handleSelectChange={handleSelectChange} birthYear={birthYear} />
        <div className="h-10" />
        <GenderRadioGroup handleRadioChange={handleRadioChange} gender={gender} />
      </div>
      <Button type="submit" disabled={!isValidPersonalInfoInput}>
        저장
      </Button>
    </form>
  )
}

export default PersonalInfoForm
