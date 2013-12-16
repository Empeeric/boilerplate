#pragma once

#include "FinProduct.h"


class Account
{
public:
	Account(void);
	~Account(void);

	int Deposit( double Amount );
	int Withdraw( double Amount );
	
	Fund FundArray[100];
	int NextFundIndex;

	double Fund;			// Sum of all deposits and withdraws
	double Cash;			
	double InvestedMarketValue;	// PortfolioValue
	double Balance;			// Cash + InvestedMarketValue
	double Profit;			// Balance - Fund

	int GetProdctByIndex(int Index, Product* Product );		// caller need to allocate Product
	int GetNumberOfProductsInPortfolio() {return PositionArrayLastIndex+1;};
	int UpdatePortfolioValue();
	double GetPortfoioMarketValue();
	int EnterNewPosToPortfolio( Position* NewPos );
	int NewPosUpdateBalance( Position* NewPos );

private:
	Position PosArray[100];		// portfolio
	int PositionArrayLastIndex;





};

