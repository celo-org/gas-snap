import { expect } from 'chai';
import sinon from 'sinon';
import {
  getFeeCurrencyNameFromAddress,
  getFeeCurrencyAddressFromName,
  getOptimalFeeCurrency,
} from '../../src/currency';
import {
  CELO_ALFAJORES,
  CELO_MAINNET,
  ceurAddressAlfajores,
  cusdAddressAlfajores,
  crealAddressAlfajores,
  ceurAddressMainnet,
  crealAddressMainnet,
  cusdAddressMainnet,
  CELO,
  CEUR,
  CREAL,
  CUSD,
  walletPKWithMoreUsd,
  walletPKWithMoreEur,
  walletPKWithMoreReal,
} from '../constants.test';
import { ContractMock } from '../contract.mock.test';
import { createMockTxRequest, createStubbedWallet } from '../wallet.mock.test';

describe('getFeeCurrencyNameFromAddress', function () {
  it('returns "celo" for undefined feeCurrencyAddress on CELO_ALFAJORES network', function () {
    expect(getFeeCurrencyNameFromAddress(undefined, CELO_ALFAJORES)).to.equal(
      CELO,
    );
  });

  it('returns "cusd" for cusdAddressAlfajores on CELO_ALFAJORES network', function () {
    expect(
      getFeeCurrencyNameFromAddress(cusdAddressAlfajores, CELO_ALFAJORES),
    ).to.equal(CUSD);
  });

  it('returns "ceur" for ceurAddressAlfajores on CELO_ALFAJORES network', function () {
    expect(
      getFeeCurrencyNameFromAddress(ceurAddressAlfajores, CELO_ALFAJORES),
    ).to.equal(CEUR);
  });

  it('returns "creal" for crealAddressAlfajores on CELO_ALFAJORES network', function () {
    expect(
      getFeeCurrencyNameFromAddress(crealAddressAlfajores, CELO_ALFAJORES),
    ).to.equal(CREAL);
  });

  it('throws error for unrecognized feeCurrencyAddress on CELO_ALFAJORES network', function () {
    expect(() =>
      getFeeCurrencyNameFromAddress('0xUnknownAddress', CELO_ALFAJORES),
    ).to.throw('Fee currency address 0xUnknownAddress not recognized.');
  });

  it('returns "celo" for undefined feeCurrencyAddress on CELO_MAINNET network', function () {
    expect(getFeeCurrencyNameFromAddress(undefined, CELO_MAINNET)).to.equal(
      CELO,
    );
  });

  it('returns "cusd" for cusdAddressMainnet on CELO_MAINNET network', function () {
    expect(
      getFeeCurrencyNameFromAddress(cusdAddressMainnet, CELO_MAINNET),
    ).to.equal(CUSD);
  });

  it('returns "ceur" for ceurAddressMainnet on CELO_MAINNET network', function () {
    expect(
      getFeeCurrencyNameFromAddress(ceurAddressMainnet, CELO_MAINNET),
    ).to.equal(CEUR);
  });

  it('returns "creal" for crealAddressMainnet on CELO_MAINNET network', function () {
    expect(
      getFeeCurrencyNameFromAddress(crealAddressMainnet, CELO_MAINNET),
    ).to.equal(CREAL);
  });

  it('throws error for unrecognized feeCurrencyAddress on CELO_MAINNET network', function () {
    expect(() =>
      getFeeCurrencyNameFromAddress('0xUnknownAddress', CELO_MAINNET),
    ).to.throw('Fee currency address 0xUnknownAddress not recognized.');
  });

  it('throws error for unrecognized network', function () {
    expect(() =>
      getFeeCurrencyNameFromAddress(undefined, 'UNKNOWN_NETWORK'),
    ).to.throw('Network UNKNOWN_NETWORK not recognized.');
  });
});

describe('getFeeCurrencyAddressFromName', () => {
  it('should return undefined for celo on CELO_ALFAJORES network', () => {
    expect(getFeeCurrencyAddressFromName(CELO, CELO_ALFAJORES)).to.be.undefined;
  });

  it('should return correct address for cusd on CELO_ALFAJORES network', () => {
    expect(getFeeCurrencyAddressFromName(CUSD, CELO_ALFAJORES)).to.equal(
      cusdAddressAlfajores,
    );
  });

  it('should return correct address for ceur on CELO_ALFAJORES network', () => {
    expect(getFeeCurrencyAddressFromName(CEUR, CELO_ALFAJORES)).to.equal(
      ceurAddressAlfajores,
    );
  });

  it('should return correct address for creal on CELO_ALFAJORES network', () => {
    expect(getFeeCurrencyAddressFromName(CREAL, CELO_ALFAJORES)).to.equal(
      crealAddressAlfajores,
    );
  });

  it('should throw error for invalid fee currency name on CELO_ALFAJORES', () => {
    expect(() =>
      getFeeCurrencyAddressFromName('invalidCurrencyName', CELO_ALFAJORES),
    ).to.throw(
      `Fee currency string invalidCurrencyName not recognized. Must be either 'celo', 'cusd', 'ceur' or 'creal'.`,
    );
  });

  it('should return undefined for celo on CELO_MAINNET network', () => {
    expect(getFeeCurrencyAddressFromName(CELO, CELO_MAINNET)).to.be.undefined;
  });

  it('should return correct address for cusd on CELO_MAINNET network', () => {
    expect(getFeeCurrencyAddressFromName(CUSD, CELO_MAINNET)).to.equal(
      cusdAddressMainnet,
    );
  });

  it('should return correct address for ceur on CELO_MAINNET network', () => {
    expect(getFeeCurrencyAddressFromName(CEUR, CELO_MAINNET)).to.equal(
      ceurAddressMainnet,
    );
  });

  it('should return correct address for creal on CELO_MAINNET network', () => {
    expect(getFeeCurrencyAddressFromName(CREAL, CELO_MAINNET)).to.equal(
      crealAddressMainnet,
    );
  });

  it('should throw error for invalid fee currency name for CELO_MAINNET', () => {
    expect(() =>
      getFeeCurrencyAddressFromName('invalidCurrencyName', CELO_MAINNET),
    ).to.throw(
      `Fee currency string invalidCurrencyName not recognized. Must be either 'celo', 'cusd', 'ceur' or 'creal'.`,
    );
  });

  it('should return undefined for unknown network', () => {
    expect(() =>
      getFeeCurrencyAddressFromName('cusd', 'UNKNOWN_NETWORK'),
    ).to.throw('Unknown Network.');
  });
});

describe('getOptimalFeeCurrency', function () {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return undefined when the optimal feeCurrency is Celo', async () => {
    const mockTxRequest = createMockTxRequest();
    const wallet = createStubbedWallet(sandbox);

    expect(await getOptimalFeeCurrency(mockTxRequest, wallet, ContractMock)).to
      .be.undefined;
  });

  it('should return cusdAddress when the optimal feeCurrency is cusd', async () => {
    const mockTxRequest = createMockTxRequest();
    const wallet = createStubbedWallet(sandbox, walletPKWithMoreUsd, 50000);

    expect(
      await getOptimalFeeCurrency(mockTxRequest, wallet, ContractMock),
    ).to.equal(cusdAddressAlfajores);
  });

  it('should return eurAddress when the optimal feeCurrency is ceur', async () => {
    const mockTxRequest = createMockTxRequest();
    const wallet = createStubbedWallet(sandbox, walletPKWithMoreEur, 50000);

    expect(
      await getOptimalFeeCurrency(mockTxRequest, wallet, ContractMock),
    ).to.equal(ceurAddressAlfajores);
  });

  it('should return realAddress when the optimal feeCurrency is creal', async () => {
    const mockTxRequest = createMockTxRequest();
    const wallet = createStubbedWallet(sandbox, walletPKWithMoreReal, 50000);

    expect(
      await getOptimalFeeCurrency(mockTxRequest, wallet, ContractMock),
    ).to.equal(crealAddressAlfajores);
  });
});
