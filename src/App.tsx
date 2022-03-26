import React, { useState, useEffect } from "react";
import { Alert, Button, InputGroup, FormControl } from "react-bootstrap";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Header from "./components/Header";
import { fetchRates, getSymbol } from "./utils/api";
import { FaSearch, FaExchangeAlt } from "react-icons/fa";
const App = () => {
  const [show, setShow] = useState(false);
  const [inputForex, setInputForex] = useState("");
  let [errMessage, setErrMsg] = useState("");
  let [conversion, setConversion] = useState({ currVal1: 0, currFor1: "", curVal2: 0, curFor2: "" });
  let [history, setHistory] = useState([] as any);
  let [symbols, setSymbols] = useState([] as any);
  let [rates, setRates] = useState([] as any);
  useEffect(() => {
    loadSymbols();
    loadRates();
  }, []);

  const loadSymbols = async () => {
    const symbols = await getSymbol();
    setSymbols(symbols);
  };
  const loadRates = async () => {
    let rates = await fetchRates("EUR");
    setRates(rates);
  };

  const currencyValidation = (curr: any, e: string) => {
    if (curr[e] === undefined) {
      setErrMsg(`Base '${e}' is not supported`);
      setShow(true);
      return true;
    } else {
      setShow(false);
      return false;
    }
  };
  const formatValidation = (e: any) => {
    if (e.length !== 4) {
      setErrMsg("Invalid input structure");
      setShow(true);
      return true;
    }
    if (isNaN(parseInt(e[0]))) {
      setErrMsg("Invalid input structure");
      setShow(true);
      return true;
    }
    if (e[2] !== "to") {
      setErrMsg("Invalid input structure");
      setShow(true);
      return true;
    }
    setShow(false);
    return false;
  };
  const handleSubmit = async (e: any) => {
    if (e.code !== "Enter") return;
    const arrInput = inputForex.split(" ");

    if (formatValidation(arrInput)) {
      return;
    }

    const countMoney = parseFloat(arrInput[0]);
    const moneyBase = arrInput[1].toUpperCase();
    const moneyConversion = arrInput[3].toUpperCase();

    try {
      if (currencyValidation(rates, moneyBase)) {
        return;
      }
      if (currencyValidation(rates, moneyConversion)) {
        return;
      }
      const ratesquery = await fetchRates(moneyBase);
      const totalprice = countMoney * ratesquery[moneyConversion];
      setConversion({ currVal1: countMoney, currFor1: moneyBase, curVal2: totalprice, curFor2: moneyConversion });
      setHistory([...history, { currVal1: countMoney, currFor1: moneyBase, curVal2: totalprice, curFor2: moneyConversion }]);
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const reverseConversion = async () => {
    const arrInput = inputForex.split(" ");

    if (formatValidation(arrInput)) {
      return;
    }

    const countMoney = parseFloat(arrInput[0]);
    const moneyBase = arrInput[1].toUpperCase();
    const moneyConversion = arrInput[3].toUpperCase();

    try {
      if (currencyValidation(rates, moneyBase)) {
        return;
      }
      if (currencyValidation(rates, moneyConversion)) {
        return;
      }
      const ratesquery = await fetchRates(moneyConversion);
      const totalprice = countMoney * ratesquery[moneyBase];

      setConversion({ currVal1: countMoney, currFor1: moneyConversion, curVal2: totalprice, curFor2: moneyBase });
      setHistory([...history, { currVal1: countMoney, currFor1: moneyConversion, curVal2: totalprice, curFor2: moneyBase }]);
    } catch (e: any) {
      console.error(e.message);
    }
  };

  return (
    <div className="app">
      <div className="app__content">
        <Header />
        <InputGroup>
          <FormControl
            value={inputForex}
            placeholder="e.g. 1 AUD to USD"
            onChange={(e) => {
              setInputForex(e.target.value);
            }}
            onKeyPress={(e) => {
              handleSubmit(e);
            }}
          />
          <Button variant="outline-secondary">
            <FaSearch />
          </Button>
        </InputGroup>
        <br></br>
        <Alert show={show} variant="danger" onClose={() => setShow(false)} dismissible>
          <p>{errMessage}</p>
        </Alert>
        <Alert show={!show && inputForex !== ""} variant="info">
          <Alert.Heading>{`${conversion.currVal1} ${symbols[conversion.currFor1]} equals`}</Alert.Heading>
          <p>
            {conversion.curVal2} {symbols[conversion.curFor2]}
          </p>
          <Button onClick={reverseConversion} variant="outline-secondary">
            <FaExchangeAlt />
          </Button>
        </Alert>
        <div>
          <h1>Previous amounts</h1>{" "}
          <Button
            variant="outline-secondary"
            onClick={() => {
              setHistory([]);
            }}>
            CLEAR ALL
          </Button>
        </div>
        <br />
        {history.map((item: any, index: number) => {
          return (
            <>
              <Alert
                key={index}
                variant="dark"
                onClose={() => {
                  let arr: any = [...history];
                  var index = arr.indexOf(item);
                  if (index !== -1) {
                    arr.splice(index, 1);
                    setHistory(arr);
                  }
                }}
                dismissible>
                <Alert.Heading>{`${item.currVal1} ${symbols[item.currFor1]} equals`}</Alert.Heading>
                <p>
                  {item.curVal2} {symbols[item.curFor2]}
                </p>
              </Alert>
            </>
          );
        })}
      </div>
      <br />
    </div>
  );
};

export default App;
