import React from 'react';

const ScoreCard = ({ score, total, questions, userAnswers, section }) => {
  const getQuestionText = (question) => {
    switch (section) {
      case 'jumbledWords':
        return question.jumbled?.replace(/\//g, ' ');
      case 'typing':
        return question.paragraph;
      case 'emailWriting':
        return question.prompt;
      case 'passageReconstruction':
        return question.sentences;
      default:
        return question.question;
    }
  };

  const isScorable = section !== 'typing' && section !== 'emailWriting' && section !== 'passageReconstruction';

  return (
    <div className="bg-green-900 text-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Detailed Results</h2>
      
      {isScorable && (
        <p className="text-lg text-center mb-8">
          You scored <span className="font-bold text-green-300">{score}</span> out of{' '}
          <span className="font-bold">{total}</span>.
        </p>
      )}

      <div className="space-y-4">
        {questions.map((question, index) => {
          const userAnswer = userAnswers[question.id] || 'Not Answered';
          const isCorrect = isScorable && (userAnswer.trim().toLowerCase() === (question.answer || '').trim().toLowerCase());

          return (
            <div key={question.id} className="p-4 bg-green-800 border border-green-700 rounded-lg text-left">
              <p className="font-bold mb-2">Question {index + 1}: {getQuestionText(question)}</p>
              
              {isScorable ? (
                <>
                  <p>Your Answer: <span className={isCorrect ? 'text-green-300' : 'text-red-400'}>{userAnswer}</span></p>
                  {!isCorrect && <p>Correct Answer: <span className="text-blue-300">{question.answer}</span></p>}
                </>
              ) : (
                <div>
                  <p className="font-semibold">Your Response:</p>
                  <p className="mt-1 p-2 bg-green-950 rounded whitespace-pre-wrap">{userAnswer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreCard;