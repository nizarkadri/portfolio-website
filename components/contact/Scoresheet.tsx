/** Where Black's reply stands: not yet played, played on the landing board, or sent with the form. */
export type ReplyState = 'waiting' | 'replied' | 'sent';

const WHITE = ['e4', 'Nf3', 'Bc4', 'O-O', 'd4', 'Re1'] as const;
export const REPLY = 'e5';

/** The score of the game so far. White has played six; Black's column is the visitor's. */
export default function Scoresheet({ reply }: { reply: ReplyState }) {
  const played = reply !== 'waiting';
  return (
    <div className="ct-score">
      <table>
        <caption className="lg-note">The game so far</caption>
        <thead>
          <tr>
            <th scope="col"><span className="bc-sr">Move</span></th>
            <th scope="col">White</th>
            <th scope="col">Black</th>
          </tr>
        </thead>
        <tbody>
          {WHITE.map((san, i) => (
            <tr key={san} className={i === 0 ? 'is-reply' : undefined}>
              <th scope="row">{i + 1}.</th>
              <td>{san}</td>
              {i === 0 ? (
                <td className="ct-score__reply">
                  {played ? (
                    <>
                      <span key={reply} className="ct-score__san">{REPLY}</span>
                      {reply === 'sent' && <span className="ct-score__mark">Sent</span>}
                    </>
                  ) : (
                    <>
                      <span className="ct-score__wait" aria-hidden="true">…</span>
                      <span className="bc-sr">not played yet</span>
                    </>
                  )}
                </td>
              ) : (
                <td><span className="bc-sr">no reply</span></td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="ct-score__status" role="status">
        {reply === 'waiting' && <>Black to play. The form is your reply.</>}
        {reply === 'replied' && <><b>1... {REPLY}</b> A good first move. Now put it in words.</>}
        {reply === 'sent' && <><b>1... {REPLY}</b> Played and sent. The next move is mine.</>}
      </p>
    </div>
  );
}
