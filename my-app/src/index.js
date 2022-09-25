import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

  function Square(props) {
    return (
        <button 
            className="square" 
            onClick={()=> props.onClick()}
        >
          {(props.isBold) ? <b>{props.value}</b> : props.value}
        </button>
    );
  }
  
  class Board extends React.Component {

    renderSquare(i, isBold=false) {
      return (
        <Square
            key={i} 
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
            isBold={isBold}
        />
      );
    }

    drawSquares() {
      let squares = [];
      for(let row = 0; row < 3; row++) {
        let rowSquares = [];
        for(let col=0; col < 3; col++) {
          let index = col + (row * 3)
          if (this.props.winningLine) {
            if (this.props.winningLine.includes(index)) {
              rowSquares.push(this.renderSquare(index, true));
            } else {
              rowSquares.push(this.renderSquare(index));
            }
          } else {
            rowSquares.push(this.renderSquare(index));
          }
        }
        squares.push(<div className="board-row" key={row}>{rowSquares}</div>);
      }
      return squares;
    }
  
    render() {
      return (
        <div>
          {this.drawSquares()}
        </div>
      );
    }
  }
  
  class Game extends React.Component {
      constructor(props) {
          super(props);
          this.state = {
              history: [{
                  squares: Array(9).fill(null),
                  moveIndex: null,
              }],
              stepNumber: 0,
              xIsNext: true,
              sortDecending: true,
          };
      }

      handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber+1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinningLine(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares,
                moveIndex: i,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    handleClickSort(){
      this.setState({
        ...this.state,
        sortDecending: !this.state.sortDecending,
      })
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        })
    }

    deriveXCordinate(i) {
      if ([0,3,6].includes(i)) {
        return 1;
      } else if ([1,4,7].includes(i)) {
        return 2;
      } else { // 2,5,8
        return 3;
      }
    }

    deriveYCordinate(i) {
      if ([0,1,2].includes(i)) {
        return 1;
      } else if ([3,4,5].includes(i)) {
        return 2;
      } else { // 6,7,8
        return 3;
      }
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winningLine = calculateWinningLine(current.squares);
        const winner = (winningLine) ? current.squares[winningLine[0]] : null;

        const moves = history.map((step, move) => {
            const desc = move ?
              'Go to move # ' + move + ' (' + this.deriveXCordinate(step.moveIndex) 
                + ', ' + this.deriveYCordinate(step.moveIndex) + ')':
              'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>
                      {(move === this.state.stepNumber) ? <b>{desc}</b> : desc}
                    </button>
                </li>
            )
        })
        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
      return (
        <div className="game">
          <div className="game-board">
            <Board 
                squares={current.squares}
                onClick={(i) => this.handleClick(i)}
                winningLine={winningLine}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <div>
              <button onClick={() => this.handleClickSort()}>
                Toggle sort
              </button>
            </div>
            <ol>{(this.state.sortDecending) ? moves : moves.reverse()}</ol>
          </div>
        </div>
      );
    }
  }

  function calculateWinningLine(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return lines[i];
      }
    }
    return null;
  }
  
  // ========================================
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Game />);