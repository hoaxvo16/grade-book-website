import { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router';
import { useCountdownTimer } from 'shared/hooks';
import { PopupAlert } from 'shared/components';
import { userViewModel } from 'shared/view-models';
import { RequestConfirmationCodeForm, SuccessMessage } from './components';
import { getVerificationCodeError } from './helper';
import { confirmEmailViewModel } from 'shared/view-models';
import { ErrorType } from './types';

export const ConfirmEmailPage = observer(() => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [codeSent, setCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const history = useHistory();

  //start countdown with 10 minutes
  const timer: {
    countdown: number;
    isRunning: boolean;
    startCountDown: () => void;
    pauseCountDown: () => void;
  } = useCountdownTimer(1000 * 600);

  const user = userViewModel.user;

  //dont add timer in dependencies
  useEffect(() => {
    if (user.isEmailConfirmed === false) timer.startCountDown();
    else history.push('/');
  }, []);

  useEffect(() => {
    if (timer.isRunning) if (codeSent) timer.pauseCountDown();
  }, [timer, codeSent]);

  useEffect(() => {
    if (timer.isRunning) if (timer.countdown === 0) timer.pauseCountDown();
  }, [timer.countdown, timer]);

  const handleSendCodeClick = useCallback(async () => {
    setIsSendingCode(true);

    let message = getVerificationCodeError(confirmationCode);

    if (message === '') {
      const result: ErrorType = await confirmEmailViewModel.verifyIsValidCode(
        confirmationCode
      );

      if (result.status) setCodeSent(true);
      message = result.errorMessage;
    }

    setIsSendingCode(false);
    setErrorMessage(message);
  }, [confirmationCode, confirmEmailViewModel]);

  const onHide = useCallback(() => {
    confirmEmailViewModel.deleteError();
    history.push('/');
  }, [history, confirmEmailViewModel]);

  const content =
    codeSent === true ? (
      <SuccessMessage />
    ) : (
      <RequestConfirmationCodeForm
        confirmationCode={confirmationCode}
        countdown={timer.countdown}
        handleSendCodeClick={handleSendCodeClick}
        handleChange={setConfirmationCode}
        isLoading={isSendingCode}
        errorMessage={errorMessage}
      />
    );
  return (
    <div>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '80vh' }}
      >
        {content}
      </div>
      <PopupAlert
        show={confirmEmailViewModel.isError}
        error={true}
        onHide={onHide}
        message={confirmEmailViewModel.message}
      />
    </div>
  );
});
