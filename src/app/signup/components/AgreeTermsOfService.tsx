import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/common/Button'
import { CheckDefault, CheckboxSelected } from '@/components/common/icons'

const CONSENT = {
  all: '모두 동의',
  termsOfService: '[필수] 서비스 이용약관 동의',
  privacyPolicy: '[필수] 개인정보 처리방침 동의',
} as const

type Consent = (typeof CONSENT)[keyof typeof CONSENT]

const AgreeTermsOfService = ({ moveNextStep }: { moveNextStep: () => void }) => {
  const [consented, setConsented] = useState<Consent[]>([])

  const toggleConsentAll = () => {
    const isAllConsented = consented.length === Object.keys(CONSENT).length - 1

    if (isAllConsented) {
      setConsented([])
      return
    }

    if (!isAllConsented) {
      setConsented([CONSENT.termsOfService, CONSENT.privacyPolicy])
      return
    }
  }

  const toggleConsent = (consent: Consent) => {
    const isConsentIncludes = consented.includes(consent)

    if (isConsentIncludes) {
      setConsented((prev) => prev.filter((item) => item !== consent))
      return
    }

    if (!isConsentIncludes) {
      setConsented((prev) => [...prev, consent])
      return
    }
  }

  return (
    <div className="grid h-full">
      <div>
        <p className="font-semibold text-2xl">
          지름알림 서비스 이용약관에
          <br />
          동의해주세요.
        </p>
        <div className="pt-[88px] select-none">
          <ConsentAll consented={consented} toggleConsentAll={toggleConsentAll} />
          <div className="grid items-center pt-6 gap-y-4">
            <ConsentRequired
              consent={CONSENT.termsOfService}
              consented={consented}
              link={'https://seonkyo.notion.site/8edd5934ff8d4ec68d75bd136e6a3052'}
              toggleConsent={toggleConsent}
            />
            <ConsentRequired
              consent={CONSENT.privacyPolicy}
              consented={consented}
              link={'https://seonkyo.notion.site/389d4f8ea8f741aca2ec5448fb86ac1f'}
              toggleConsent={toggleConsent}
            />
          </div>
        </div>
      </div>
      <Button
        onClick={moveNextStep}
        disabled={
          !(consented.includes(CONSENT.termsOfService) && consented.includes(CONSENT.privacyPolicy))
        }
        className="self-end"
      >
        다음
      </Button>
    </div>
  )
}

export default AgreeTermsOfService

const ConsentAll = ({
  consented,
  toggleConsentAll,
}: {
  consented: Consent[]
  toggleConsentAll: () => void
}) => {
  return (
    <label
      onChange={toggleConsentAll}
      className="flex gap-x-2 items-center font-semibold cursor-pointer"
    >
      <input type="checkbox" className="hidden" />
      {consented.includes(CONSENT.termsOfService) && consented.includes(CONSENT.privacyPolicy) ? (
        <CheckboxSelected className="text-primary-600" />
      ) : (
        <CheckboxSelected className="text-gray-300" />
      )}
      {CONSENT.all}
    </label>
  )
}

const ConsentRequired = ({
  consent,
  consented,
  link,
  toggleConsent,
}: {
  consent: Consent
  consented: Consent[]
  link: string
  toggleConsent: (consent: Consent) => void
}) => {
  const handleCheckboxChange = () => {
    toggleConsent(consent)
  }

  return (
    <div className="grid grid-flow-col">
      <label onChange={handleCheckboxChange} className="flex gap-x-2 items-center cursor-pointer">
        <input type="checkbox" name="terms-of-service" className="hidden" />
        {consented.includes(consent) ? (
          <CheckDefault className="text-primary-600" />
        ) : (
          <CheckDefault className="text-gray-300" />
        )}
        {consent}
      </label>
      <div className="justify-self-end">
        <Link href={link} className="text-link underline">
          보기
        </Link>
      </div>
    </div>
  )
}
