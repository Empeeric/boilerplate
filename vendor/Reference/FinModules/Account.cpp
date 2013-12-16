#include "stdafx.h"
#include "Account.h"


Account::Account(void)
{
	Fund					= 0;
	Cash					= 0;
	InvestedMarketValue		= 0;
	Balance					= 0;
	Profit					= 0;
	NextFundIndex			= 0;
	PositionArrayLastIndex	= -1;
}

Account::~Account(void)
{
}

int Account::Deposit( double Amount )
{
	Fund += Amount;
	Cash += Amount;
	Balance = InvestedMarketValue + Cash;
	Profit = Balance - Fund;
	FundArray[NextFundIndex].Amount = Amount;
	GetSystemTime( &(FundArray[NextFundIndex].FundDateTime) );

	NextFundIndex++;
	if ( NextFundIndex >= 100 )
		NextFundIndex = 0;

	return 0;
}

int Account::Withdraw( double Amount )
{
	Deposit ( Amount * -1 );
	return 0;
}


int Account::GetProdctByIndex(int Index, Product* Product /*Out*/)
{
	if ( Product == NULL )
		return -1;

	if ( (Index < 0) || (Index > PositionArrayLastIndex) )
		return -1;

	(*Product ) = PosArray[Index].Product;
	
	return 0;
}

int Account::EnterNewPosToPortfolio( Position* NewPos )
{
	if ( NewPos == NULL )
		return -1;

	PositionArrayLastIndex++;
	if ( PositionArrayLastIndex >= 100 )
	{
		return -2;
	}
	PosArray[PositionArrayLastIndex] = (*NewPos);

	return 0;
}

int Account::NewPosUpdateBalance( Position* NewPos )
{
	if ( NewPos == NULL )
	{
		return -1;
	}

	Cash -= (NewPos->Asset1ExecutedPriceEnter + NewPos->Asset2ExecutedPriceEnter);  	

	InvestedMarketValue += (NewPos->Asset1ExecutedPriceEnter + NewPos->Asset2ExecutedPriceEnter); 
	
	Balance = Cash + InvestedMarketValue;
	Profit	= Balance - Fund;

	return 0;
}

int Account::UpdatePortfolioValue()
{
	// For every position in the portfolio:
	// 1. Send request from client to get assets values
	// 2. update position value





	return 0;
}